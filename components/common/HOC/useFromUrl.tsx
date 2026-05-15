import { useRouter } from "next/router";

/**
 * Returns the 'fromUrl' parameter from the current URL query parameters
 * Uses Next.js router instead of window.location
 * @returns The fromUrl value as string or null if not present
 */
export function useFromUrl(): string | null {
  const router = useRouter();
  const fromUrl = [router.query.fromUrl].flat()[0];
  return fromUrl ?? null;
}

/**
 * Creates a fromUrl parameter string based on the current path
 * @returns A URL parameter string in the format 'fromUrl=encodedCurrentPath'
 */
export function useFromUrlParam(): string {
  const router = useRouter();
  return `fromUrl=${encodeURIComponent(router.asPath)}`;
}
