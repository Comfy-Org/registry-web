import { Breadcrumb } from "flowbite-react";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { HiHome } from "react-icons/hi";
import NodeDetails from "@/components/nodes/NodeDetails";
import { useGetPublisher } from "@/src/api/generated";
import { useNextTranslation } from "@/src/hooks/i18n";
import {
  getTranslatedNodeContent,
  translateNodeContent,
  TranslatedNodeContent,
} from "@/src/hooks/i18n/translateNode";

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps<{
  nodeName: string | null;
  translatedContent: TranslatedNodeContent | null;
}> = async ({ params, locale }) => {
  const nodeId = params?.nodeId as string;
  const publisherId = params?.publisherId as string;
  if (!nodeId || !publisherId) return { notFound: true };

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return {
        props: { nodeName: null, translatedContent: null },
        revalidate: 60,
      };
    }

    const res = await fetch(
      `${backendUrl}/nodes/${encodeURIComponent(nodeId)}?include_translations=true`,
    );
    if (!res.ok) throw new Error(`API ${res.status}`);
    const node = await res.json();

    // Validate that the node belongs to the publisher in the URL
    if (node.publisher?.id && node.publisher.id !== publisherId) {
      return {
        redirect: {
          destination: `/publishers/${node.publisher.id}/nodes/${nodeId}`,
          permanent: false,
        },
      };
    }

    const extracted = getTranslatedNodeContent(node, locale ?? "en");
    const translatedContent = await translateNodeContent(extracted, node.description);

    return {
      props: { nodeName: node.name ?? null, translatedContent },
      revalidate: 3600,
    };
  } catch {
    return {
      props: { nodeName: null, translatedContent: null },
      revalidate: 60,
    };
  }
};

const NodeView = ({
  nodeName,
  translatedContent,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const { publisherId, nodeId } = router.query;
  const { data: publisher } = useGetPublisher(publisherId as string);
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
      <Breadcrumb className="py-4">
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
        <Breadcrumb.Item
          href={`/publishers/${publisherId}`}
          onClick={(e) => {
            e.preventDefault();
            router.push(`/publishers/${publisherId}`);
          }}
          className="dark"
        >
          {publisher?.name || publisherId}
        </Breadcrumb.Item>
        <Breadcrumb.Item className="text-blue-500">{nodeId as string}</Breadcrumb.Item>
      </Breadcrumb>

      <NodeDetails translatedContent={translatedContent} />
    </div>
  );
};

export default NodeView;
