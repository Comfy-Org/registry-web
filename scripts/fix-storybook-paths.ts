#!/usr/bin/env bun
/**
 * Fix Storybook paths to use /_storybook/ prefix
 * This script updates index.html and iframe.html to use absolute paths
 * so Storybook works correctly when deployed under /_storybook/ subdirectory
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const STORYBOOK_DIR = 'public/_storybook'
const BASE_PATH = '/_storybook/'

function fixPaths(filePath: string) {
    console.log(`Fixing paths in ${filePath}...`)

    let content = readFileSync(filePath, 'utf-8')

    // Replace all relative paths with absolute paths using /_storybook/ prefix
    // Match patterns like: href="./something" or src="./something" or import './something'
    content = content.replace(
        /(['"])\.\/([^'"]+)(['"])/g,
        (match, quote1, path, quote2) => {
            // Don't modify if it's already absolute
            if (path.startsWith('/') || path.startsWith('http')) {
                return match
            }
            return `${quote1}${BASE_PATH}${path}${quote2}`
        }
    )

    // Also fix absolute paths that should be under /_storybook/
    // Match patterns like: src="/vite-inject-mocker-entry.js"
    content = content.replace(
        /(['"])\/([^'"\/][^'"]*\.(?:js|css|json|svg|png|jpg|jpeg|gif|woff|woff2))(['"])/g,
        (match, quote1, path, quote2) => {
            // Skip if it's already under /_storybook/ or is an external URL
            if (
                path.startsWith('_storybook/') ||
                path.startsWith('http') ||
                path.startsWith('//')
            ) {
                return match
            }
            return `${quote1}${BASE_PATH}${path}${quote2}`
        }
    )

    writeFileSync(filePath, content, 'utf-8')
    console.log(`✓ Fixed ${filePath}`)
}

// Fix both index.html (manager UI) and iframe.html (preview frame)
const filesToFix = [
    join(process.cwd(), STORYBOOK_DIR, 'index.html'),
    join(process.cwd(), STORYBOOK_DIR, 'iframe.html'),
]

for (const file of filesToFix) {
    try {
        fixPaths(file)
    } catch (error) {
        console.error(`Error fixing ${file}:`, error)
        process.exit(1)
    }
}

console.log('\n✅ All Storybook paths fixed successfully!')
