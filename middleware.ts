import { LANGUAGE_STORAGE_KEY } from '@/src/constants'
import { detectLanguageFromHeader, isRedirectExcludedUrl, SUPPORTED_LANGUAGES } from '@/src/hooks/i18n/serverUtils'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware to handle server-side language detection and redirection
 * This runs on every request before the page is rendered
 */
export function middleware(request: NextRequest) {
    // Get current URL and pathname
    const url = request.nextUrl.clone()
    const { pathname } = url

    // Skip redirects for excluded URLs
    if (isRedirectExcludedUrl(pathname)) {
        return NextResponse.next()
    }

    // Check if user has a language preference in cookies
    const cookieLanguage = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value

    // Check if user's preferred language is already set in cookies
    if (cookieLanguage && SUPPORTED_LANGUAGES.includes(cookieLanguage)) {
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
