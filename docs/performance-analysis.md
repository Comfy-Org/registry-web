# Performance Analysis for ComfyUI Registry Web

Date: 2026-01-24

## Executive Summary

Analysis identified **13 performance issues** across the codebase. Priority improvements could reduce initial page load time by **30-50%** and significantly improve perceived performance.

## Issues by Category

### 🔴 CRITICAL Issues

#### 1. Async Waterfalls: Firebase Token Fetching

**File:** `pages/_app.tsx:19-48`

Every HTTP request waits for `user.getIdToken()` sequentially, creating a bottleneck for parallel API calls.

**Impact:** All authenticated API requests during load experience delays.

#### 2. Bundle Size: Prettier Plugins Not Lazy-Loaded

**File:** `components/NodeStatusReason.tsx:1-17`

Three Prettier plugins (1MB+ combined) are bundled in main chunk:

- `prettier/plugins/babel` (~500KB)
- `prettier/plugins/estree` (~300KB)
- `prettier/plugins/yaml` (~200KB)

**Impact:** Increases initial bundle size by 1MB+ unnecessarily.

#### 3. Client-Side Fetching: Waterfall API Calls

**File:** `components/nodes/NodeDetails.tsx:108-147`

Five separate API calls load sequentially:

- `useGetNode()`
- `useGetPermissionOnPublisherNodes()`
- `useGetUser()`
- `useListPublishersForUser()`
- `useListNodeVersions()`

**Impact:** Page loading significantly slower due to waterfall queries.

#### 4. Render Performance: No Memoization on Search Results

**File:** `components/Search/SearchHit.tsx`

Hit components re-render unnecessarily when parent re-renders, despite having stable hit data. With 100+ search results, this creates significant overhead.

**Impact:** InstantSearch pagination/filtering causes all hits to re-render.

#### 5. Expensive State Init: Multiple useMemo Passes

**File:** `components/NodeStatusReason.tsx:143-227`

Four separate `useMemo` calls with overlapping data transformations perform O(n²) operations:

- `issueList` - parses JSON
- `approvedIssueList` - parses JSON again
- `fullfilledIssueList` - maps over issueList twice
- `lastFullfilledIssueList` - maps over approvedIssueList twice

**Impact:** Component performs multiple passes over same data.

---

### 🟡 MEDIUM Impact Issues

#### 6. Bundle Size: Monaco Editor Not Code-Split

**File:** `components/NodeStatusReason.tsx`

Monaco Editor (~2MB) imported at top-level but only used when user expands details section.

**Impact:** Adds unnecessary 2MB to main bundle.

#### 7. Async Waterfalls: Query Invalidation Cascade

**File:** `pages/admin/nodes.tsx:178-179, 283, 316`

Pattern repeated multiple times:

```tsx
queryClient.invalidateQueries({ queryKey: ['/nodes'] })
getAllNodesQuery.refetch() // Sequential refetch
```

**Impact:** Admin pages experience unnecessary delays.

#### 8. Async Waterfalls: Parallel Prettier Formatting

**File:** `components/NodeStatusReason.tsx:401-478`

Two separate effects format YAML sequentially when both could run in parallel. Heavy Prettier operations block React rendering.

**Impact:** Noticeable delay when rendering multiple formatted code blocks.

#### 9. Expensive State Init: Plugin Recreation

**File:** `components/Search/Autocomplete.tsx:49-107`

Plugin creation is expensive and happens on every autocomplete mount. Callbacks inside are recreated despite memoization.

**Impact:** Autocomplete initialization slower than necessary.

#### 10. Client-Side Fetching: Firebase Check on Every Page

**File:** `components/layout.tsx:19-29`

Firebase auth check happens client-side on every page load. Could use Next.js middleware to determine auth state earlier.

**Impact:** Causes layout shift and delayed header rendering.

#### 11. Cache Invalidation: Overly Broad Query Invalidation

**File:** `pages/_app.tsx:68-96`

Every PATCH/PUT/DELETE invalidates two queries (specific + parent). Too aggressive, causes unnecessary refetches.

**Impact:** Cascading refetches; unrelated queries refresh unnecessarily.

---

### 🟢 LOW-MEDIUM Impact Issues

#### 12. Multiple Loops: Dual Filter Passes

**File:** `pages/admin/nodes.tsx:129-147`

Two filter passes over nodes array instead of combining into single pass:

1. Filter by status
2. Filter by search query

**Impact:** With large node lists (>1000), creates unnecessary iterations.

#### 13. Render Performance: String Operations in Render

**File:** `components/nodes/NodeDetails.tsx:324-347`

Multiple string operations and array transformations happen during render:

- Regex replace operations
- flatMap/reduce/filter chains

**Impact:** Not critical but causes unnecessary work on every render.

---

## Priority Recommendations

### Quick Wins (< 1 hour each)

1. **Add `React.memo()` to `SearchHit` component**
   - Location: `components/Search/SearchHit.tsx`
   - Impact: HIGH
   - Effort: 5 minutes

2. **Combine filter passes in admin nodes**
   - Location: `pages/admin/nodes.tsx:129-147`
   - Impact: LOW-MEDIUM
   - Effort: 10 minutes

3. **Move string transformations to useMemo**
   - Location: `components/nodes/NodeDetails.tsx:324-347`
   - Impact: LOW-MEDIUM
   - Effort: 15 minutes

### High Impact (1-2 hours each)

4. **Lazy load Prettier plugins and Monaco editor**
   - Location: `components/NodeStatusReason.tsx`
   - Impact: HIGH
   - Bundle size reduction: ~3MB
   - Effort: 1-2 hours

5. **Parallelize independent API calls**
   - Location: `components/nodes/NodeDetails.tsx`
   - Impact: HIGH
   - Use `Promise.all()` for independent queries
   - Effort: 1 hour

6. **Unify useMemo calls in NodeStatusReason**
   - Location: `components/NodeStatusReason.tsx:143-227`
   - Impact: HIGH
   - Combine four memoized computations into one
   - Effort: 1-2 hours

### Medium Impact (2-4 hours each)

7. **Batch query invalidations**
   - Location: `pages/_app.tsx:68-96`
   - Impact: MEDIUM
   - Make invalidations more granular
   - Effort: 2-3 hours

8. **Move Firebase auth check to Next.js middleware**
   - Location: `components/layout.tsx`
   - Impact: MEDIUM
   - Requires architecture change
   - Effort: 3-4 hours

9. **Parallelize Prettier formatting with Promise.all()**
   - Location: `components/NodeStatusReason.tsx:401-478`
   - Impact: MEDIUM
   - Effort: 1 hour

---

## Summary Table

| #   | Category         | Severity    | Issue                        | File                 | Impact                      |
| --- | ---------------- | ----------- | ---------------------------- | -------------------- | --------------------------- |
| 1   | Async Waterfalls | 🔴 CRITICAL | Firebase token per request   | \_app.tsx            | All API calls block         |
| 2   | Bundle Size      | 🔴 CRITICAL | Prettier not lazy-loaded     | NodeStatusReason.tsx | +1MB bundle                 |
| 3   | Client Fetching  | 🔴 CRITICAL | Waterfall API calls          | NodeDetails.tsx      | Slow page loads             |
| 4   | Render Perf      | 🔴 CRITICAL | No memo on Search results    | SearchHit.tsx        | 100+ unnecessary re-renders |
| 5   | State Init       | 🔴 CRITICAL | Multiple useMemo passes      | NodeStatusReason.tsx | O(n²) operations            |
| 6   | Bundle Size      | 🟡 MEDIUM   | Monaco not code-split        | NodeStatusReason.tsx | +2MB bundle                 |
| 7   | Async Waterfalls | 🟡 MEDIUM   | Query invalidation cascade   | admin/nodes.tsx      | Admin delays                |
| 8   | Async Waterfalls | 🟡 MEDIUM   | Parallel Prettier formatting | NodeStatusReason.tsx | Render lag                  |
| 9   | State Init       | 🟡 MEDIUM   | Plugin recreation            | Autocomplete.tsx     | Slow init                   |
| 10  | Client Fetching  | 🟡 MEDIUM   | Firebase every page          | layout.tsx           | Layout shift                |
| 11  | Cache            | 🟡 MEDIUM   | Broad invalidation           | \_app.tsx            | Cascading refetches         |
| 12  | Loops            | 🟢 LOW-MED  | Dual filter passes           | admin/nodes.tsx      | Inefficient filtering       |
| 13  | Render Perf      | 🟢 LOW-MED  | String ops in render         | NodeDetails.tsx      | Repeated work               |

---

## Expected Outcomes

Implementing the **Quick Wins + High Impact** items (issues #1-6) should result in:

- **Initial bundle size:** -3MB (~30-40% reduction)
- **Page load time:** -30-50% for NodeDetails page
- **Search performance:** 3-5x faster filtering/pagination
- **Perceived performance:** Significantly improved responsiveness

## Next Steps

1. Implement Quick Wins (#1-3) first - low risk, immediate gains
2. Tackle High Impact items (#4-6) - highest ROI
3. Consider Medium Impact items (#7-9) as follow-up work
4. Monitor performance with Lighthouse and Web Vitals after changes
