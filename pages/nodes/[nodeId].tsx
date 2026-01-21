import { Breadcrumb } from "flowbite-react";
import { useRouter } from "next/router";
import { HiHome } from "react-icons/hi";
import { useNextTranslation } from "@/src/hooks/i18n";
import NodeDetails from "../../components/nodes/NodeDetails";

const NodeView = () => {
  const router = useRouter();
  const { nodeId } = router.query;
  const { t } = useNextTranslation();

  return (
    <div className="p-4">
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

      <NodeDetails />
    </div>
  );
};

export default NodeView;
