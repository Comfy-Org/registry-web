import { NextRequest, NextResponse } from 'next/server'
import { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from '@/src/constants'
import {
  detectLanguageFromHeader,
  isRedirectExcludedUrl,
} from '@/src/hooks/i18n/serverUtils'

// Match well-known search engine + social crawlers. Catches the long tail via
// the generic /bot|crawler|spider/ pattern. Used to route bot requests to the
// blocking-translation /_bot/* page variants so SEO meta tags stay localized.
const BOT_UA =
  /bot|crawler|spider|crawling|googlebot|bingbot|duckduckbot|yandex|baidu|slurp|facebookexternalhit|twitterbot|linkedinbot|applebot|ahrefs|semrush/i

const NODE_PAGE_PATH = /^\/nodes\/[^/]+$|^\/publishers\/[^/]+\/nodes\/[^/]+$/

/**
 * Middleware to handle server-side language detection and redirection
 * This runs on every request before the page is rendered
 */
export function middleware(request: NextRequest) {
  // Get current URL and pathname
  const url = request.nextUrl.clone()
  const { pathname } = url

  // Bot rewrite: route search-engine crawlers hitting node detail pages to
  // the blocking-ISR /_bot/* variant so the rendered HTML always contains
  // localized meta tags. The URL stays the same to the bot (rewrite, not
  // redirect), so this isn't cloaking — both routes serve identical content,
  // only the timing of when the translation is awaited differs.
  if (NODE_PAGE_PATH.test(pathname)) {
    const ua = request.headers.get('user-agent') ?? ''
    if (BOT_UA.test(ua)) {
      url.pathname = `/_bot${pathname}`
      return NextResponse.rewrite(url)
    }
  }

  // Direct human access to /_bot/* (e.g. URL typed in address bar) is
  // bounced to the canonical human path so the bot route stays internal.
  if (pathname.startsWith('/_bot/')) {
    url.pathname = pathname.replace(/^\/_bot/, '')
    return NextResponse.redirect(url)
  }

  // Skip redirects for excluded URLs
  if (isRedirectExcludedUrl(pathname)) {
    return NextResponse.next()
  }

  // Check if user has a language preference in cookies
  const cookieLanguage = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value

  // Check if user's preferred language is already set in cookies
  if (cookieLanguage && SUPPORTED_LANGUAGES.includes(cookieLanguage as any)) {
    // User has a valid language preference, no need to redirect
    return NextResponse.next()
  }

  // Detect preferred language from Accept-Language header
  const detectedLanguage = detectLanguageFromHeader(request)

  // Create response to set cookie with detected language
  const response = NextResponse.next()

  // Set cookie with the detected language
  response.cookies.set(LANGUAGE_STORAGE_KEY, detectedLanguage, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })

  return response
}

/**
 * Configure the middleware to run on specific paths
 */
export const config = {
  // Match all request paths except for excluded paths
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. /locales (translation files)
     * 5. all files in the public folder
     */
    '/((?!api|_next|static|locales|favicon.ico|robots.txt).*)',
  ],
}
