#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const storybookDir = 'public/_storybook'
const iframeHtmlPath = join(process.cwd(), storybookDir, 'iframe.html')

try {
    let content = readFileSync(iframeHtmlPath, 'utf-8')

    // Fix absolute paths in iframe.html
    content = content
        .replace(
            'src="/vite-inject-mocker-entry.js"',
            'src="/_storybook/vite-inject-mocker-entry.js"'
        )
        .replace(
            '<base target="_parent" />',
            '<base href="/_storybook/" target="_parent" />'
        )

    writeFileSync(iframeHtmlPath, content, 'utf-8')
    console.log('✓ Fixed Storybook paths for production deployment')
} catch (error) {
    console.error('Error fixing Storybook paths:', error)
    process.exit(1)
}
