import type { NextApiRequest, NextApiResponse } from "next";
import { SUPPORTED_LANGUAGES } from "@/src/constants";
import { getTranslatedNodeContent, translateNodeContent } from "@/src/hooks/i18n/translateNode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nodeId, locale } = req.query;
  // nodeId: 1-128 chars, alphanumeric + dash/underscore/dot to match registry naming
  const nodeIdValid =
    typeof nodeId === "string" &&
    nodeId.length > 0 &&
    nodeId.length <= 128 &&
    /^[\w.-]+$/.test(nodeId);
  if (
    !nodeIdValid ||
    typeof locale !== "string" ||
    locale === "en" ||
    !SUPPORTED_LANGUAGES.includes(locale as any)
  ) {
    return res.status(400).json({ error: "valid nodeId and supported non-en locale required" });
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!backendUrl || !apiKey) {
    return res.status(503).json({ error: "translation unavailable" });
  }

  try {
    const nodeRes = await fetch(
      `${backendUrl}/nodes/${encodeURIComponent(nodeId)}?include_translations=true`,
    );
    if (!nodeRes.ok) throw new Error(`API ${nodeRes.status}`);
    const node = await nodeRes.json();

    const extracted = getTranslatedNodeContent(node, locale);
    const translated = await translateNodeContent(extracted, node.description);

    // TODO: persist translation to DB once server-to-server auth is available (see #258)

    // Cache the translated response for 1 hour
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.json(translated);
  } catch {
    return res.status(500).json({ error: "translation failed" });
  }
}
