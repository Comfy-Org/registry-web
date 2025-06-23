import { promises as fs, existsSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

/**
 * Simplified i18n translation key extractor
 */

interface ExtractedKey {
  key: string;
  file: string;
  line: number;
}

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, '.cache/extracted-i18n-keys.json');
const LOCALES_DIR = path.join(ROOT_DIR, 'public/locales');
const EN_LOCALE_FILE = path.join(LOCALES_DIR, 'en/common.json');

// Regex to match t('key') patterns
const TRANSLATION_KEY_REGEX = /\bt\(\s*(['"`])([^'"`\n\r\\${}]+?)\1/g;

// Validate translation keys
function isValidKey(key: string): boolean {
  return key.length > 1 && 
         !key.includes('${') && 
         !key.includes("')[") && 
         !key.includes('||') &&
         !/^[^a-zA-Z0-9\s]*$/.test(key);
}

async function findTsxFiles(): Promise<string[]> {
  return glob('**/*.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: ['**/node_modules/**', '**/\.git/**', '**/\.next/**', '**/dist/**', '**/build/**', '**/public/**'],
    absolute: true,
  });
}

async function extractKeysFromFile(filePath: string): Promise<ExtractedKey[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Only process files that use translation
    if (!content.includes('useNextTranslation') && !content.includes('{ t }')) {
      return [];
    }

    const extractedKeys: ExtractedKey[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      let match;
      TRANSLATION_KEY_REGEX.lastIndex = 0;
      
      while ((match = TRANSLATION_KEY_REGEX.exec(line)) !== null) {
        const key = match[2];
        if (isValidKey(key)) {
          extractedKeys.push({
            key,
            file: filePath,
            line: index + 1,
          });
        }
      }
    });

    return extractedKeys;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

async function readJsonFile(filePath: string): Promise<Record<string, string>> {
  try {
    if (existsSync(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`Could not read ${filePath}:`, error);
  }
  return {};
}

async function writeJsonFile(filePath: string, data: Record<string, string>): Promise<void> {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }
  
  // Sort keys alphabetically
  const sorted = Object.keys(data).sort().reduce((obj, key) => {
    obj[key] = data[key];
    return obj;
  }, {} as Record<string, string>);
  
  await fs.writeFile(filePath, JSON.stringify(sorted, null, 2) + '\n');
}

async function getAvailableLanguages(): Promise<string[]> {
  try {
    const dirEntries = await fs.readdir(LOCALES_DIR, { withFileTypes: true });
    return dirEntries
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(lang => lang !== 'en');
  } catch (error) {
    console.warn('Could not read locales directory:', error);
    return [];
  }
}

async function updateLocaleFiles(uniqueKeys: string[]): Promise<void> {
  // Read existing English translations
  const existingEnTranslations = await readJsonFile(EN_LOCALE_FILE);

  // Find new and unused keys
  const newKeys = uniqueKeys.filter(key => !existingEnTranslations[key]);
  const unusedKeys = Object.keys(existingEnTranslations).filter(key => !uniqueKeys.includes(key));

  // Update English translations
  const updatedEnTranslations = { ...existingEnTranslations };
  newKeys.forEach(key => { updatedEnTranslations[key] = key; });
  unusedKeys.forEach(key => { delete updatedEnTranslations[key]; });

  await writeJsonFile(EN_LOCALE_FILE, updatedEnTranslations);

  console.log(`\nlocales/en/common.json Updated:`);
  console.log(`+ ${newKeys.length} new keys`);
  console.log(`- ${unusedKeys.length} unused keys\n`);

  // Update other language files
  const availableLanguages = await getAvailableLanguages();
  for (const lang of availableLanguages) {
    const langFile = path.join(LOCALES_DIR, `${lang}/common.json`);
    const existingLangTranslations = await readJsonFile(langFile);
    
    // Add new keys (use English as fallback), remove unused keys
    newKeys.forEach(key => { existingLangTranslations[key] = updatedEnTranslations[key]; });
    unusedKeys.forEach(key => { delete existingLangTranslations[key]; });
    
    await writeJsonFile(langFile, existingLangTranslations);
    console.log(`Updated ${lang}: +${newKeys.length} -${unusedKeys.length}`);
  }
}

async function main() {
  try {
    console.log('Extracting i18n translation keys...');

    const files = await findTsxFiles();
    console.log(`Found ${files.length} TypeScript/TSX files to scan`);

    const allKeys: ExtractedKey[] = [];
    for (const file of files) {
      const keys = await extractKeysFromFile(file);
      allKeys.push(...keys);
    }

    console.log(`Found ${allKeys.length} translation key usages`);

    // Group keys and get unique ones
    const groupedKeys: Record<string, { count: number, files: string[] }> = {};
    allKeys.forEach((key) => {
      const relativePath = path.relative(ROOT_DIR, key.file);
      if (!groupedKeys[key.key]) {
        groupedKeys[key.key] = { count: 0, files: [] };
      }
      groupedKeys[key.key].count++;
      if (!groupedKeys[key.key].files.includes(relativePath)) {
        groupedKeys[key.key].files.push(relativePath);
      }
    });

    const uniqueKeys = Object.keys(groupedKeys);
    console.log(`Found ${uniqueKeys.length} unique translation keys`);

    // Create output
    const output = {
      timestamp: new Date().toISOString(),
      totalKeyUsages: allKeys.length,
      uniqueKeysCount: uniqueKeys.length,
      keys: groupedKeys,
    };

    // Write results
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!existsSync(outputDir)) {
      await fs.mkdir(outputDir, { recursive: true });
    }
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`Results written to ${OUTPUT_FILE}`);

    // Update locale files
    await updateLocaleFiles(uniqueKeys);

  } catch (error) {
    console.error('Error extracting keys:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Execute the script
main();
