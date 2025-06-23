import { promises as fs } from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const LOCALES_DIR = path.join(ROOT_DIR, 'public/locales');
const EXTRACTED_KEYS_FILE = path.join(ROOT_DIR, '.cache/extracted-i18n-keys.json');

async function readLocaleFile(filePath: string): Promise<Record<string, string>> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Warning: Could not read locale file ${filePath}`, error);
    return {};
  }
}

async function writeLocaleFile(filePath: string, translations: Record<string, string>): Promise<void> {
  // Sort keys alphabetically
  const sortedTranslations: Record<string, string> = {};
  Object.keys(translations).sort().forEach(key => {
    sortedTranslations[key] = translations[key];
  });
  
  await fs.writeFile(filePath, JSON.stringify(sortedTranslations, null, 2) + '\n');
}

async function getValidKeys(): Promise<string[]> {
  try {
    const content = await fs.readFile(EXTRACTED_KEYS_FILE, 'utf-8');
    const data = JSON.parse(content);
    return Object.keys(data.keys);
  } catch (error) {
    console.error('Error reading extracted keys file:', error);
    return [];
  }
}

async function getAvailableLanguages(): Promise<string[]> {
  try {
    const dirEntries = await fs.readdir(LOCALES_DIR, { withFileTypes: true });
    return dirEntries
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  } catch (error) {
    console.warn('Warning: Could not read locales directory', error);
    return [];
  }
}

async function cleanupInvalidKeys(): Promise<void> {
  console.log('Cleaning up invalid translation keys...');
  
  const validKeys = await getValidKeys();
  const availableLanguages = await getAvailableLanguages();
  
  console.log(`Found ${validKeys.length} valid keys`);
  console.log(`Found ${availableLanguages.length} language directories: ${availableLanguages.join(', ')}`);
  
  for (const lang of availableLanguages) {
    const langFile = path.join(LOCALES_DIR, `${lang}/common.json`);
    const existingTranslations = await readLocaleFile(langFile);
    
    const existingKeys = Object.keys(existingTranslations);
    const invalidKeys = existingKeys.filter(key => !validKeys.includes(key));
    
    if (invalidKeys.length > 0) {
      console.log(`\n${lang}: Found ${invalidKeys.length} invalid keys to remove:`);
      invalidKeys.forEach(key => {
        console.log(`  - "${key}"`);
        delete existingTranslations[key];
      });
      
      await writeLocaleFile(langFile, existingTranslations);
      console.log(`✓ ${lang}: Removed ${invalidKeys.length} invalid keys`);
    } else {
      console.log(`\n${lang}: No invalid keys found`);
    }
  }
  
  console.log('\nCleanup completed!');
}

// Execute the script
cleanupInvalidKeys().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
