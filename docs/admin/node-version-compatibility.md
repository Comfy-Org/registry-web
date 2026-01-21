# Node Version Compatibility Admin

The Node Version Compatibility Admin page allows administrators to manage compatibility information for node versions in the ComfyUI registry. This includes specifying supported ComfyUI versions, operating systems, and accelerators for each node version.

## Overview

This admin tool provides a comprehensive interface for updating node version compatibility fields that help users understand which versions of ComfyUI, operating systems, and hardware accelerators are supported by specific node versions.

## Features

### Filtering and Search

- **Node ID Filter**: Filter the table by specific node IDs to quickly find relevant node versions
- **Status Filter**: Filter by node version status (e.g., published, deprecated, etc.)

### Compatibility Management

- **ComfyUI Frontend Version**: Specify which ComfyUI frontend versions are supported
- **ComfyUI Version**: Define compatible ComfyUI backend versions
- **Operating Systems**: List supported operating systems (Windows, macOS, Linux, etc.)
- **Accelerators**: Specify supported hardware accelerators (CUDA, ROCm, Metal, CPU, etc.)

### User Interface

- **Modal-based Editing**: Clean, focused editing experience in a dedicated modal
- **Specification Reference**: Direct link to ComfyUI registry specifications documentation
- **Keyboard Shortcuts**: Support for Ctrl+Enter (or Cmd+Enter on Mac) to submit forms
- **Bulk Information Display**: Overview of all node versions in a sortable table
- **Responsive Design**: Works across different screen sizes and devices
- **Dark Mode Support**: Full dark mode theming for improved accessibility

## How to Use

### Accessing the Page

1. Navigate to the Admin Dashboard
2. Click on "Node Version Compatibility" from the admin menu
3. The page displays a table of all node versions with their compatibility information

### Filtering Node Versions

1. **By Node ID**:
   - Enter a node ID in the "Filter by Node ID" field
   - The table will show only matching node versions
2. **By Status**:
   - Click the "Select Statuses" dropdown
   - Choose one or more status filters
   - Click "Clear Filters" to remove all status filters

### Editing Compatibility Information

1. **Open Edit Modal**:
   - Click the "Edit" button for any node version row
   - A modal will open with the current compatibility information
   - The modal includes a specification reference link to the ComfyUI registry documentation
   - The modal displays the node ID and version at the top for reference

2. **Update Fields**:
   - **ComfyUI Frontend Version**: Enter the supported frontend version (e.g., "1.2.0")
   - **ComfyUI Version**: Enter the supported backend version (e.g., "0.1.0")
   - **Operating Systems**: Enter one OS per line (e.g., "Windows", "macOS", "Linux")
   - **Accelerators**: Enter one accelerator per line (e.g., "CUDA", "ROCm", "Metal", "CPU")

3. **Save Changes**:
   - Click "Save Changes" to apply updates
   - Use Ctrl+Enter (or Cmd+Enter on Mac) as a keyboard shortcut to submit
   - Click "Cancel" to discard changes
   - A success/error message will appear based on the operation result

## Data Format

### Operating Systems

Enter operating systems one per line. Common values include:

- Windows
- macOS
- Linux
- Ubuntu
- CentOS
- Debian

### Accelerators

Enter accelerators one per line. Common values include:

- CUDA
- ROCm
- Metal
- CPU
- OpenCL
- DirectML

### Version Formats

- Use semantic versioning (e.g., "1.2.0", "0.1.0")
- Support version ranges where applicable
- Be consistent with ComfyUI's versioning scheme

## Technical Details

### API Integration

- Uses `useListAllNodeVersions` to fetch node version data
- Uses `useAdminUpdateNodeVersion` mutation for updates
- Supports pagination with configurable page size
- Real-time filtering with debounced API calls

### State Management

- Modal state managed locally within the component
- Form values controlled through React Hook Form with validation
- Optimistic updates with error handling
- Automatic form reset on modal close
- Support for keyboard shortcuts (Ctrl+Enter/Cmd+Enter)

### Error Handling

- Toast notifications for success/error states
- Enhanced error messages from API responses
- Form validation before submission
- Graceful handling of API failures
- Proper error boundaries for robust user experience

## Permissions

This page requires admin-level permissions. Access is controlled by the `withAdmin` HOC (Higher-Order Component) that wraps the main component.

## Best Practices

### Data Entry

1. **Be Specific**: Use exact version numbers when possible
2. **Be Consistent**: Follow established patterns for OS and accelerator names
3. **Test Thoroughly**: Verify compatibility information before publishing
4. **Document Changes**: Keep track of what changes you make and why

### Performance

1. **Use Filters**: When working with large datasets, use filters to reduce load
2. **Batch Updates**: Consider making multiple updates in sequence rather than individual calls
3. **Monitor Status**: Pay attention to loading states and error messages
4. **Keyboard Shortcuts**: Use Ctrl+Enter (Cmd+Enter on Mac) for faster form submission

### Accessibility

1. **Dark Mode**: The interface supports both light and dark themes
2. **Keyboard Navigation**: Full keyboard support for form navigation and submission
3. **Screen Readers**: Proper labeling and ARIA attributes for accessibility
4. **Visual Indicators**: Clear visual feedback for form states and validation

### Maintenance

1. **Regular Reviews**: Periodically review and update compatibility information
2. **Version Alignment**: Keep compatibility info aligned with actual ComfyUI releases
3. **User Feedback**: Incorporate user feedback about compatibility issues

## Troubleshooting

### Common Issues

1. **Save Failures**: Check network connectivity and admin permissions
2. **Filter Not Working**: Ensure proper formatting of filter values
3. **Modal Not Opening**: Check for JavaScript errors in browser console

### Error Messages

- "Node ID is required": The node version lacks a proper ID
- "Node Version Number is required": The version field is missing
- "Failed to update node version": Network or permission issue

## Related Documentation

- [Admin Dashboard Overview](./index.md)
- [Node Management](./nodes.md)
- [API Documentation](../api/admin.md)
