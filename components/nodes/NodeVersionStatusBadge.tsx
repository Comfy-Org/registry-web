import { Badge } from "flowbite-react";
import { NodeVersionStatus } from "@/src/api/generated";
import { useNextTranslation } from "@/src/hooks/i18n";

const NodeVersionStatusBadge: React.FC<{ status?: NodeVersionStatus }> = ({ status }) => {
  const { t } = useNextTranslation();
  if (status === NodeVersionStatus.NodeVersionStatusActive) {
    return <Badge color="success">{t("Live")}</Badge>;
  }

  if (
    status === NodeVersionStatus.NodeVersionStatusPending ||
    status === NodeVersionStatus.NodeVersionStatusFlagged
  ) {
    return <Badge color="warning">{t("Pending Security Review")}</Badge>;
  }

  if (status === NodeVersionStatus.NodeVersionStatusBanned) {
    return <Badge color="failure">{t("Rejected")}</Badge>;
  }

  return null;
};

export default NodeVersionStatusBadge;
