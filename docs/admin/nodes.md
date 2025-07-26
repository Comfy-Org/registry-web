# Admin Node Management Dashboard

## Overview

Administrative interface for managing nodes in the ComfyUI Registry.

## Implementation Tasks

### Completed

- [x] Created documentation structure
- [x] Set up project development environment

### In Progress

- [ ] Create /admin/nodes page structure
- [ ] Implement node listing table with pagination
- [ ] Add node filtering capabilities
- [ ] Create node edit modal

### TODO

- [ ] Add table columns:
    - Node (Name + @nodeId)
    - Publisher (name + publisherId)
    - Categories
    - Tags
    - Node status
    - Actions (edit button)
- [ ] Implement node admin edit modal
- [ ] Add save functionality with ctrl+enter
- [ ] Test pagination and filters
- [ ] Validate edit operations

## API Endpoints Used

- `useListAllNodes` - Fetch nodes with pagination and filters
- `useUpdateNode` - Update node tags and categories (requires publisherId)

## Technical Notes

- Following pattern from `/admin/nodeversions` page
- Using Flowbite React components for UI consistency
- Node interface includes: id, category, tags, status, publisher, etc.
- NodeStatus enum: Active, Deleted, Banned

## Files Modified

- `/pages/admin/nodes.tsx` - Main admin node management page
- `/docs/admin/nodes.md` - This documentation file
