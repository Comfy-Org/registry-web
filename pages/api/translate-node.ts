import type { NextApiRequest, NextApiResponse } from "next";
import { getTranslatedNodeContent, translateNodeContent } from "@/src/hooks/i18n/translateNode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { nodeId, locale } = req.query;
  if (typeof nodeId !== "string" || typeof locale !== "string" || locale === "en") {
    return res.status(400).json({ error: "nodeId and non-en locale required" });
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

    // Cache the translated response for 1 hour
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.json(translated);
  } catch {
    return res.status(500).json({ error: "translation failed" });
  }
}
