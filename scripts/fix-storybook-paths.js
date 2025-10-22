#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const storybookDir = 'public/_storybook'
const iframeHtmlPath = join(process.cwd(), storybookDir, 'iframe.html')

try {
    let content = readFileSync(iframeHtmlPath, 'utf-8')

    // Convert absolute paths to relative paths so it works both in Chromatic and production
    content = content.replace(
        'src="/vite-inject-mocker-entry.js"',
        'src="./vite-inject-mocker-entry.js"'
    )

    writeFileSync(iframeHtmlPath, content, 'utf-8')
    console.log('✓ Fixed Storybook paths to use relative paths')
} catch (error) {
    console.error('Error fixing Storybook paths:', error)
    process.exit(1)
}
