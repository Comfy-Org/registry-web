const fs = require('fs');
const path = require('path');

// Configuration
const localesDir = path.join(process.cwd(), 'public', 'locales');
const supportedLocales = ['en', 'zh', 'ja'];
const baseLocale = 'en';

// Get all translation keys from the base locale (English)
function getTranslationKeys(locale) {
  const filePath = path.join(localesDir, locale, 'common.json');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return Object.keys(JSON.parse(content));
  } catch (error) {
    console.error(`Error reading ${locale} translations:`, error.message);
    return [];
  }
}

// Check for missing translations
function checkMissingTranslations() {
  const baseKeys = getTranslationKeys(baseLocale);
  let hasMissingTranslations = false;
  
  supportedLocales.forEach(locale => {
    if (locale === baseLocale) return;
    
    const localeKeys = getTranslationKeys(locale);
    const missingKeys = baseKeys.filter(key => !localeKeys.includes(key));
    
    if (missingKeys.length > 0) {
      hasMissingTranslations = true;
      console.warn(`\n[${locale}] Missing translations for ${missingKeys.length} keys:`);
      missingKeys.forEach(key => console.warn(`  - "${key}"`));
    } else {
      console.log(`\n[${locale}] All translations are complete!`);
    }
  });
  
  return hasMissingTranslations;
}

// Main execution
console.log('Checking for missing translations...');
const hasMissingTranslations = checkMissingTranslations();

if (hasMissingTranslations) {
  console.warn('\nWarning: Some translations are missing. The build will continue, but please consider adding the missing translations.');
} else {
  console.log('\nSuccess: All translations are complete!');
}

// Exit with success code (even if there are missing translations, we just warn)
process.exit(0);
