# React Best Practices (Vercel)

Source: https://vercel.com/blog/introducing-react-best-practices

## Core Performance Framework

An **ordered framework** prioritizing high-impact optimizations over micro-level tweaks. The two foundational fixes that typically improve real-world metrics first are:

1. **Eliminate waterfalls** - Remove sequential async operations that block unnecessarily
2. **Reduce bundle size** - Decrease JavaScript shipped on every page load

## Eight Performance Categories

The framework spans eight optimization areas, rated from CRITICAL to LOW impact:

1. Eliminating async waterfalls
2. Bundle size optimization
3. Server-side performance
4. Client-side data fetching
5. Re-render optimization
6. Rendering performance
7. Advanced patterns
8. JavaScript performance

## Specific Code Patterns

### Anti-Pattern: Blocking Unnecessary Work

```javascript
// WRONG: Fetches data even when it won't be used
async function handleRequest(userId, skipProcessing) {
  const userData = await fetchUserData(userId) // Always executes
  if (skipProcessing) return { skipped: true }
  return processUserData(userData)
}
```

### Correct Pattern: Conditional Blocking

```javascript
// CORRECT: Only fetches when needed
async function handleRequest(userId, skipProcessing) {
  if (skipProcessing) return { skipped: true }
  const userData = await fetchUserData(userId) // Only when needed
  return processUserData(userData)
}
```

## Real-World Optimization Examples

### 1. Combining Loop Iterations

**Problem:** Scanning same data structure multiple times wastes cycles

```javascript
// WRONG: Multiple passes
const valid = items.filter((item) => item.isValid)
const active = items.filter((item) => item.isActive)
const premium = items.filter((item) => item.isPremium)
```

```javascript
// CORRECT: Single pass
const categorized = items.reduce(
  (acc, item) => {
    if (item.isValid) acc.valid.push(item)
    if (item.isActive) acc.active.push(item)
    if (item.isPremium) acc.premium.push(item)
    return acc
  },
  { valid: [], active: [], premium: [] }
)
```

### 2. Parallelizing Awaits

**Problem:** Independent database calls run sequentially

```javascript
// WRONG: Sequential (slow)
const user = await fetchUser(userId)
const posts = await fetchPosts(userId)
const comments = await fetchComments(userId)
```

```javascript
// CORRECT: Parallel (fast)
const [user, posts, comments] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
  fetchComments(userId),
])
```

### 3. Lazy State Initialization

**Problem:** Expensive operations run on every render

```javascript
// WRONG: Runs expensiveCalculation() on every render
const [value, setValue] = useState(expensiveCalculation())
```

```javascript
// CORRECT: Only runs once on mount
const [value, setValue] = useState(() => expensiveCalculation())
```

## Application to AI-Assisted Development

These practices can be compiled into `AGENTS.md` or similar documentation, enabling consistent application across codebases via AI-assisted refactoring.

## Priority Order for Optimization

1. **CRITICAL:** Eliminate async waterfalls (biggest user-facing impact)
2. **HIGH:** Reduce bundle size (affects every page load)
3. **MEDIUM:** Optimize server-side performance
4. **MEDIUM:** Improve client-side data fetching
5. **LOW-MEDIUM:** Re-render optimization
6. **LOW:** Rendering performance micro-optimizations
7. **LOW:** Advanced patterns
8. **VERY LOW:** JavaScript performance micro-optimizations

## Key Takeaway

Focus on the top of the priority list first. Fixing one async waterfall or reducing bundle size by 500KB will have more real-world impact than optimizing thousands of lines of JavaScript logic.
