export function parseJsonSafe(
  json: string | null | undefined,
): { data: any; error: null } | { error: unknown; data: null } {
  try {
    return { data: JSON.parse(json?.toString() as string), error: null };
  } catch (e) {
    return { error: e, data: null };
  }
}
