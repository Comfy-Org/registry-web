# Admin Dashboard Documentation

## Overview

The admin dashboard provides Comfy-Org members and Registry Admins with tools to manage the Registry platform. The dashboard is accessible at `/admin` and requires admin authentication.

## Pages and Components

### Admin Index (`/admin`)

The main dashboard page that provides navigation to all admin tools:

- **Search Ranking Table** - Manage search result rankings
- **Preempted Comfy Node Names Management** - Handle reserved node names
- **Review Node Versions** - Review and moderate submitted node versions
- **Manage Unclaimed Nodes** - Handle nodes that need to be claimed by publishers
- **Node Version Compatibility** - Manage compatibility metadata for node versions

### Node Version Compatibility (`/admin/node-version-compatibility`)

A specialized admin page for managing node version compatibility metadata. This page allows admins to:

#### Features

- View all node versions in a paginated table
- Edit compatibility fields for each node version:
  - `supported_comfyui_frontend_version` - ComfyUI Frontend version constraints
  - `supported_comfyui_version` - ComfyUI version constraints
  - `supported_os` - Operating system compatibility
  - `supported_accelerators` - Hardware accelerator support

#### Workflow

1. Admin identifies a compatibility issue from user reports (GitHub, Discord, Reddit, etc.)
2. Navigates to `/admin/node-version-compatibility`
3. Finds the specific node version in the table
4. Clicks "Edit" to modify compatibility fields
5. Updates the relevant compatibility constraints (e.g., adding `<0.0.4` for ComfyUI Frontend incompatibility)
6. Saves the changes

#### Example Use Case

If `comfyui-impact-pack` v1.0.2 is reported as incompatible with `ComfyUI_frontend` v0.0.4:

1. Find the row for `comfyui-impact-pack` version `1.0.2`
2. Click "Edit"
3. Update `supported_comfyui_frontend_version` field to `<0.0.4`
4. Save changes

### Style and Components

The admin pages follow consistent styling patterns:

- **Layout**: Uses Flowbite React components for consistent UI
- **Navigation**: Breadcrumb navigation for context
- **Tables**: Flowbite Table components with inline editing capabilities
- **Forms**: TextInput components for field editing
- **Buttons**: Consistent button sizing and colors (success for save, gray for cancel, primary for edit)
- **Feedback**: Toast notifications for success/error states
- **Loading**: Spinner components during API calls

### Common Patterns

- **withAdmin HOC**: All admin pages are wrapped with authentication
- **React Query**: Uses tanstack/react-query for data fetching and mutations
- **Inline Editing**: Click-to-edit pattern for table cells
- **Toast Notifications**: User feedback for actions
- **Error Handling**: Graceful error states and user-friendly messages

### Authentication

All admin pages require admin-level authentication through the `withAdmin` higher-order component.
