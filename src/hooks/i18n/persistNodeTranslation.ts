import type { TranslatedNodeContent } from './translateNode'

/**
 * Server-side helper to persist an auto-generated node translation back to
 * the registry backend via `POST /nodes/{nodeId}/translations`, authenticated
 * with the shared admin secret (`X-Comfy-Admin-Secret`).
 *
 * Intended to be fire-and-forget after a successful OpenAI auto-translation
 * in the bot path's `getStaticProps`, so subsequent ISR builds can read the
 * stored translation instead of calling OpenAI again.
 *
 * Silently no-ops when:
 *   - `COMFY_REGISTRY_ADMIN_SECRET` is not set (e.g. preview deploys without
 *     the secret),
 *   - `NEXT_PUBLIC_BACKEND_URL` is not set, or
 *   - the content does not come from an `auto` translation.
 *
 * Failures are logged but never thrown — the calling page render must not
 * fail because the persistence step did.
 */
export async function persistNodeTranslation(
  nodeId: string,
  content: TranslatedNodeContent
): Promise<void> {
  if (content.source !== 'auto') return
  if (!content.description) return

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const adminSecret = process.env.COMFY_REGISTRY_ADMIN_SECRET
  if (!backendUrl || !adminSecret) return

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(
      `${backendUrl}/nodes/${encodeURIComponent(nodeId)}/translations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Comfy-Admin-Secret': adminSecret,
        },
        body: JSON.stringify({
          data: {
            [content.locale]: { description: content.description },
          },
        }),
        signal: controller.signal,
      }
    )
    if (!res.ok) {
      console.warn(
        `[i18n-isr] persistNodeTranslation: backend returned ${res.status} for node=${nodeId} locale=${content.locale}`
      )
    }
  } catch (err) {
    console.warn(
      `[i18n-isr] persistNodeTranslation failed for node=${nodeId} locale=${content.locale}:`,
      err
    )
  } finally {
    clearTimeout(timeout)
  }
}
