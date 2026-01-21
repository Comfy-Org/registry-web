import { parse } from "accept-language-parser";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "../../constants";

/**
 * Detects the preferred language from the Accept-Language HTTP header
 * @param req - The HTTP request object
 * @returns The detected language code or default language if none detected
 */
export function detectLanguageFromHeader(req: Request): string {
  // Get the Accept-Language header
  const acceptLanguage = req.headers.get("accept-language");

  if (!acceptLanguage) {
    return DEFAULT_LANGUAGE;
  }

  // Parse the Accept-Language header
  const languages = parse(acceptLanguage);

  // Find the first supported language from the user's preferences
  for (const lang of languages) {
    const code = lang.code.toLowerCase();
    // Check if language code matches exactly (e.g., 'en', 'ja')
    if (SUPPORTED_LANGUAGES.includes(code)) {
      return code;
    }

    // Check for partial match (e.g., 'zh-CN' should match 'zh')
    const matchingLang = SUPPORTED_LANGUAGES.find((supportedLang) =>
      code.startsWith(supportedLang),
    );

    if (matchingLang) {
      return matchingLang;
    }
  }

  // If no match, return default language
  return DEFAULT_LANGUAGE;
}

/**
 * Checks if a URL should be excluded from language redirection
 * @param url - The URL to check
 * @returns True if the URL should be excluded, false otherwise
 */
export function isRedirectExcludedUrl(url: string): boolean {
  // Exclude API routes, static files, etc.
  const excludedPaths = [
    "/api/",
    "/_next/",
    "/static/",
    "/locales/",
    "/favicon.ico",
    "/robots.txt",
  ];

  return excludedPaths.some((path) => url.startsWith(path));
}
