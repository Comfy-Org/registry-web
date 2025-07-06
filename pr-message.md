# Add Breadcrumb Navigation

This PR adds breadcrumb navigation to improve user experience and site navigation across the application. 

## Changes:

- Added breadcrumb navigation components to all main pages:
  - Home page
  - Node details pages
  - Publisher pages
  - Admin pages
  - Search results
  
- Improved UI by using Flowbite Breadcrumb components for consistent styling
  
- Enhanced navigation context for users to:
  - Know their current location in the site hierarchy
  - Navigate back to parent pages easily
  - Create a more intuitive user flow
  
- Specific breadcrumb navigation flow:
  - Added "Your Nodes" breadcrumb level between Home and Publisher pages
  - Configured "Nodes" breadcrumb in NodeDetails pages to navigate to home page
  - Ensured consistent navigation paths across all site sections

## Additional Changes:

- Updated various dependencies including Algolia search (4.24.0)
- Added testing script with coverage reporting (`bun test --coverage`)
- Removed env encryption scripts (`enc`, `dec`)
- Fixed various React component warnings:
  - Updated Link usage to avoid legacyBehavior prop
  - Improved accessibility for clickable elements
  - Better type handling in NodeDetails component
  
- Improved UI for node administration:
  - Added admin controls for Search Ranking and Preempted Node Names
  - Enhanced repository linking and display
  - Better handling of download buttons

## Technical Notes:

- This is a UI enhancement that doesn't affect underlying data or API integration
- The breadcrumbs follow standard UX patterns for hierarchical navigation
- All pages maintain mobile responsiveness
