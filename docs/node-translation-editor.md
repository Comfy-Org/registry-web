# Node Translation Editor

## Overview

The Node Translation Editor is a feature that allows authenticated users to create and manage translations for ComfyUI custom nodes. It provides a user-friendly interface for translating node metadata into multiple languages supported by the registry.

## Features

- **Multi-language Support**: Supports all 7 languages configured in the registry (English, Chinese, Japanese, French, Spanish, Korean, Russian)
- **Field Management**: Edit common node fields (name, description, category, tags) and add custom translation fields
- **Real-time Editing**: Live editing interface with immediate feedback
- **Translation Persistence**: Automatically saves translations using the `createNodeTranslations` API
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Authentication Required**: Protected route that requires user authentication

## Technical Implementation

### API Integration

The feature integrates with two main API endpoints:

1. **`getNode` with `include_translations: true`**
    - Retrieves node data along with existing translations
    - Type: `NodeTranslations = {[key: string]: { [key: string]: unknown }}`

2. **`createNodeTranslations`**
    - Saves new or updated translations
    - Body type: `CreateNodeTranslationsBody = { data?: CreateNodeTranslationsBodyData }`
    - Data format: `{[language]: {[field]: value}}`

### Component Structure

```
pages/nodes/[nodeId]/i18n.tsx
├── Authentication (withAuth HOC)
├── Node Data Fetching (useGetNode)
├── Translation Management State
├── Language Selection UI
├── Field Editor Interface
├── Save Functionality (useCreateNodeTranslations)
└── Error/Success Feedback
```

### Key Components

- **Language Selector**: Dropdown to switch between supported languages
- **Field Editor**: Dynamic form fields for translating node metadata
- **Custom Field Addition**: Interface to add new translatable fields
- **Save Button**: Persists changes to the backend

## Usage

### Accessing the Editor

Navigate to `/nodes/[nodeId]/i18n` for any valid node ID. The page is protected by authentication, so users must be logged in.

### Editing Translations

1. Select target language from dropdown
2. Edit existing fields or add new custom fields
3. Enter translations for each field
4. Click "Save Translations" to persist changes

### Supported Fields

**Default Fields:**

- `name` - Node display name
- `description` - Node description
- `category` - Node category
- `tags` - Node tags (as string)

**Custom Fields:**
Users can add any additional fields needed for their specific node translations.

## File Structure

```
pages/nodes/[nodeId]/i18n.tsx          # Main translation editor page
src/stories/pages/NodeTranslationEditor.stories.tsx  # Storybook stories
docs/node-translation-editor.md        # This documentation
```

## Storybook Stories

The component includes comprehensive Storybook stories demonstrating:

- **Default**: Basic translation editor functionality
- **WithExistingTranslations**: Editor with pre-existing translations
- **LoadingState**: Loading skeleton during data fetch
- **NodeNotFound**: Error state for invalid node IDs
- **SaveError**: Error handling during save operations
- **NoTranslations**: Empty state with no existing translations

## API Data Flow

```
1. User navigates to /nodes/[nodeId]/i18n
2. Page fetches node data with getNode({include_translations: true})
3. Component displays existing translations and empty fields
4. User selects language and edits translations
5. User clicks save → calls createNodeTranslations API
6. Success/error feedback displayed to user
```

## Error Handling

The component handles several error scenarios:

- **Network Errors**: API request failures
- **Authentication Errors**: Redirected by withAuth HOC
- **Node Not Found**: 404 errors display appropriate message
- **Save Failures**: Clear error messages with retry capability

## Future Enhancements

Potential improvements for the translation editor:

1. **Bulk Translation**: Support for translating multiple fields at once
2. **Translation Memory**: Suggest translations based on previous entries
3. **Validation**: Field-specific validation rules
4. **Preview Mode**: Preview how translations appear in the node interface
5. **Import/Export**: Bulk import/export of translation files
6. **Collaboration**: Multi-user translation workflows

## Related Documentation

- [i18n.md](./i18n.md) - Overall internationalization system
- [authentication-system.md](./authentication-system.md) - Authentication system
- [api-architecture.md](./api-architecture.md) - API integration patterns
