#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const storybookDir = 'public/_storybook'
const iframeHtmlPath = join(process.cwd(), storybookDir, 'iframe.html')
const indexHtmlPath = join(process.cwd(), storybookDir, 'index.html')

try {
    // Fix iframe.html
    let iframeContent = readFileSync(iframeHtmlPath, 'utf-8')
    iframeContent = iframeContent.replace(
        'src="/vite-inject-mocker-entry.js"',
        'src="./vite-inject-mocker-entry.js"'
    )
    writeFileSync(iframeHtmlPath, iframeContent, 'utf-8')

    // Fix index.html - add base tag for manager
    let indexContent = readFileSync(indexHtmlPath, 'utf-8')

    // Add base tag to head if not already present
    if (!indexContent.includes('<base href=')) {
        indexContent = indexContent.replace(
            '<head>',
            '<head>\n    <base href="/_storybook/" />'
        )
    }

    writeFileSync(indexHtmlPath, indexContent, 'utf-8')
    console.log('✓ Fixed Storybook paths to use correct base paths')
} catch (error) {
    console.error('Error fixing Storybook paths:', error)
    process.exit(1)
}
