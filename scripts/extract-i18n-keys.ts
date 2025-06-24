import axios from 'axios'
import * as fs from 'fs/promises'
import { glob } from 'glob'
import path from 'path'

/**
 * Simplified i18n translation key extractor
 */

interface ExtractedKey {
    key: string
    file: string
}

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..')
const OUTPUT_FILE = path.join(ROOT_DIR, '.cache/extracted-i18n-keys.json')
const LOCALES_DIR = path.join(ROOT_DIR, 'public/locales')
const EN_LOCALE_FILE = path.join(LOCALES_DIR, 'en/common.json')

// Regex to match t('key') patterns
const TRANSLATION_KEY_REGEX = /\bt\(\s*(['"`])([\s\S]+?)\1/g

async function findTsxFiles(): Promise<string[]> {
    return glob('**/*.{ts,tsx}', {
        cwd: ROOT_DIR,
        ignore: [
            '**/node_modules/**',
            '**/\.git/**',
            '**/\.next/**',
            '**/dist/**',
            '**/build/**',
            '**/public/**',
        ],
        absolute: true,
    })
}

async function extractKeysFromFile(filePath: string): Promise<ExtractedKey[]> {
    try {
        const content = await fs.readFile(filePath, 'utf-8')

        // Only process files that use translation
        if (
            !content.includes('useNextTranslation') &&
            !content.includes('{ t }')
        ) {
            return []
        }

        const extractedKeys: ExtractedKey[] = []

        const matches = [...content.matchAll(TRANSLATION_KEY_REGEX)]
        matches.forEach((match) => {
            const key = match[2]
            if (key.includes('${'))
                throw new Error(
                    `Dynamic keys are not supported: ${key} in file ${filePath}`
                )
            extractedKeys.push({
                key,
                file: filePath,
            })
        })

        return extractedKeys
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error)
        return []
    }
}

async function readJsonFile(filePath: string): Promise<Record<string, string>> {
    try {
        const content = await fs.readFile(filePath, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        console.warn(`Could not read ${filePath}:`, error)
    }
    return {}
}

async function writeJsonFile(
    filePath: string,
    data: Record<string, string>
): Promise<void> {
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })

    // Sort keys alphabetically
    const sorted = Object.keys(data)
        .sort()
        .reduce(
            (obj, key) => {
                obj[key] = data[key]
                return obj
            },
            {} as Record<string, string>
        )

    await fs.writeFile(filePath, JSON.stringify(sorted, null, 2) + '\n')
}

async function getAvailableLanguages(): Promise<string[]> {
    try {
        const dirEntries = await fs.readdir(LOCALES_DIR, {
            withFileTypes: true,
        })
        return dirEntries
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name)
            .filter((lang) => lang !== 'en')
    } catch (error) {
        console.warn('Could not read locales directory:', error)
        return []
    }
}

async function translateKeyToLanguage(
    key: string,
    lang: string,
    existingTranslations: Record<string, string>
): Promise<string> {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are a translation assistant. Translate the following key into specified language. Use the provided translations for consistency. No explaination needed, just return the translation.`,
                    },
                    {
                        role: 'system',
                        content: `For translation consistency, Existing translations: ${JSON.stringify(existingTranslations)}`,
                    },
                    // Example
                    {
                        role: 'user',
                        content: `Translate to zh: "Welcome to our website"`,
                    },
                    {
                        role: 'assistant',
                        content: `欢迎来到我们的网站`,
                    },
                    // real
                    {
                        role: 'user',
                        content: `Translate to ${lang}: "${key}"`,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ` + process.env.OPENAI_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        )

        const translatedText = response.data.choices[0].message.content
        return translatedText.trim()
    } catch (error) {
        throw new Error(
            `Error translating key "${key}" to ${lang}: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}

async function updateLocaleFiles(uniqueKeys: string[]): Promise<void> {
    // Read existing English translations
    const existingEnTranslations = await readJsonFile(EN_LOCALE_FILE)

    // Find new and unused keys for English
    const newKeysEn = uniqueKeys.filter((key) => !existingEnTranslations[key])
    const unusedKeysEn = Object.keys(existingEnTranslations).filter(
        (key) => !uniqueKeys.includes(key)
    )

    // Update English translations
    const updatedEnTranslations = { ...existingEnTranslations }
    newKeysEn.forEach((key) => {
        updatedEnTranslations[key] = key
    })
    unusedKeysEn.forEach((key) => {
        delete updatedEnTranslations[key]
    })

    await writeJsonFile(EN_LOCALE_FILE, updatedEnTranslations)

    console.log(`\nlocales/en/common.json Updated:`)
    console.log(`+ ${newKeysEn.length} new keys`)
    console.log(`- ${unusedKeysEn.length} unused keys\n`)

    // Update other language files only if OPENAI_API_KEY is set
    if (!process.env.OPENAI_API_KEY) {
        console.warn(
            'OPENAI_API_KEY is not set. Skipping updates for other languages.'
        )
        return
    }

    const availableLanguages = await getAvailableLanguages()
    for (const lang of availableLanguages) {
        const langFile = path.join(LOCALES_DIR, `${lang}/common.json`)
        const existingLangTranslations = await readJsonFile(langFile)

        // Find new and unused keys for the current language
        const newKeysLang = uniqueKeys.filter(
            (key) => !existingLangTranslations[key]
        )
        const unusedKeysLang = Object.keys(existingLangTranslations).filter(
            (key) => !uniqueKeys.includes(key)
        )

        // Update translations for the current language
        const updatedLangTranslations = { ...existingLangTranslations }
        for (const key of newKeysLang) {
            const translation = await translateKeyToLanguage(
                key,
                lang,
                existingLangTranslations
            )
            updatedLangTranslations[key] = translation
            console.log(`+ ${lang} ${key}: ${translation}`)
        }
        unusedKeysLang.forEach((key) => {
            delete updatedLangTranslations[key]
        })

        await writeJsonFile(langFile, updatedLangTranslations)
        console.log(
            `Updated ${lang}: +${newKeysLang.length} -${unusedKeysLang.length}`
        )
    }
}

async function main() {
    try {
        console.log('Extracting i18n translation keys...')

        const files = await findTsxFiles()
        console.log(`Found ${files.length} TypeScript/TSX files to scan`)

        const allKeys: ExtractedKey[] = []
        for (const file of files) {
            const keys = await extractKeysFromFile(file)
            allKeys.push(...keys)
        }

        console.log(`Found ${allKeys.length} translation key usages`)

        // Group keys and get unique ones
        const groupedKeys: Record<string, { count: number; files: string[] }> =
            {}
        allKeys.forEach((key) => {
            const relativePath = path.relative(ROOT_DIR, key.file)
            if (!groupedKeys[key.key]) {
                groupedKeys[key.key] = { count: 0, files: [] }
            }
            groupedKeys[key.key].count++
            if (!groupedKeys[key.key].files.includes(relativePath)) {
                groupedKeys[key.key].files.push(relativePath)
            }
        })

        const uniqueKeys = Object.keys(groupedKeys)
        console.log(`Found ${uniqueKeys.length} unique translation keys`)

        // Create output
        const output = {
            timestamp: new Date().toISOString(),
            totalKeyUsages: allKeys.length,
            uniqueKeysCount: uniqueKeys.length,
            keys: groupedKeys,
        }

        // Write results
        const outputDir = path.dirname(OUTPUT_FILE)
        await fs.mkdir(outputDir, { recursive: true })
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2))
        console.log(`Results written to ${OUTPUT_FILE}`)

        // Update locale files
        await updateLocaleFiles(uniqueKeys)
    } catch (error) {
        console.error(
            'Error extracting keys:',
            error instanceof Error ? error.message : String(error)
        )
        process.exit(1)
    }
}

// Execute the script
main()
