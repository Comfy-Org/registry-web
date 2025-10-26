import i18next from 'i18next'
import { Metadata } from 'next'
import { Providers } from './providers'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'ComfyUI Registry',
  description: 'Discover and install ComfyUI custom nodes.',
  icons: {
    icon: '/favicon.ico',
  },
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to 'en', will be handled by i18n middleware/client-side detection
  const locale = 'en'
  const dir = i18next.dir(locale)

  return (
    <html lang={locale} dir={dir}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
