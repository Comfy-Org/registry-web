import { GetStaticPaths, GetStaticProps } from "next";
import { loadNodeStaticProps } from "@/src/hooks/i18n/nodeStaticProps";
import { TranslatedNodeContent } from "@/src/hooks/i18n/translateNode";
import NodeView from "../../nodes/[nodeId]";

/**
 * Bot-only variant of /nodes/[nodeId] that blocks ISR on the OpenAI
 * translation so search engine crawlers always see localized meta tags
 * in the rendered HTML. Reached only via middleware rewrite when the
 * request User-Agent matches a known bot — humans use the non-blocking
 * /nodes/[nodeId] route directly.
 */
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps<{
  nodeId: string;
  nodeName: string | null;
  translatedContent: TranslatedNodeContent | null;
}> = async ({ params, locale }) => {
  const nodeId = params?.nodeId as string;
  if (!nodeId) return { notFound: true };

  return loadNodeStaticProps({ nodeId, locale: locale ?? "en", blocking: true });
};

export default NodeView;
