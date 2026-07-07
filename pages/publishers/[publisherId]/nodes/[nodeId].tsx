import { Breadcrumb } from "flowbite-react";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { HiHome } from "react-icons/hi";
import NodeDetails from "@/components/nodes/NodeDetails";
import { useGetPublisher } from "@/src/api/generated";
import { useNextTranslation } from "@/src/hooks/i18n";
import { loadNodeStaticProps } from "@/src/hooks/i18n/nodeStaticProps";
import { TranslatedNodeContent } from "@/src/hooks/i18n/translateNode";

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
  const publisherId = params?.publisherId as string;
  if (!nodeId || !publisherId) return { notFound: true };

  // Human path: non-blocking. See pages/nodes/[nodeId].tsx for rationale.
  return loadNodeStaticProps({
    nodeId,
    publisherId,
    locale: locale ?? "en",
    blocking: false,
  });
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
