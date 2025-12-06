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
  // TODO: Re-implement i18n configuration for App Router
  // For now, default to 'en' locale and 'ltr' direction
  const locale = 'en'
  const dir = 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
