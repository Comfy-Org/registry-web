import type { Preview } from '@storybook/react'
import '../styles/globals.css' // Import the global CSS file

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
}

export default preview
