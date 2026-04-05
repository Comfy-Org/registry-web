import { Breadcrumb } from "flowbite-react";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { HiHome } from "react-icons/hi";
import { useNextTranslation } from "@/src/hooks/i18n";
import {
  getTranslatedNodeContent,
  translateNodeContent,
  TranslatedNodeContent,
} from "@/src/hooks/i18n/translateNode";
import NodeDetails from "../../components/nodes/NodeDetails";

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

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return {
        props: { nodeId, nodeName: null, translatedContent: null },
        revalidate: 60,
      };
    }

    const res = await fetch(
      `${backendUrl}/nodes/${encodeURIComponent(nodeId)}?include_translations=true`,
    );
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
    const node = await res.json();

    const extracted = getTranslatedNodeContent(node, locale ?? "en");
    const translatedContent = await translateNodeContent(
      extracted,
      node.description,
      node.latest_version?.changelog,
    );

    return {
      props: {
        nodeId,
        nodeName: node.name ?? null,
        translatedContent,
      },
      revalidate: 3600,
    };
  } catch {
    return {
      props: { nodeId, nodeName: null, translatedContent: null },
      revalidate: 60,
    };
  }
};

const NodeView = ({
  nodeName,
  translatedContent,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const { nodeId } = router.query;
  const { t } = useNextTranslation();
  const title = nodeName ? `${nodeName} - ${t("ComfyUI Registry")}` : t("ComfyUI Registry");
  const description = translatedContent?.description ?? "";

  return (
    <div className="p-4">
      <Head>
        <title>{title}</title>
        {description && <meta name="description" content={description.slice(0, 160)} />}
        {description && <meta property="og:description" content={description.slice(0, 160)} />}
        {nodeName && <meta property="og:title" content={title} />}
      </Head>
      <div className="py-4">
        <Breadcrumb>
          <Breadcrumb.Item
            href="/"
            icon={HiHome}
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
            }}
            className="dark"
          >
            {t("Home")}
          </Breadcrumb.Item>
          <Breadcrumb.Item className="dark">{t("All Nodes")}</Breadcrumb.Item>
          <Breadcrumb.Item className="dark text-blue-500">{nodeId as string}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <NodeDetails translatedContent={translatedContent} />
    </div>
  );
};

export default NodeView;
