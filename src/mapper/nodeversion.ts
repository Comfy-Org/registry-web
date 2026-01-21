import { NodeVersionStatus } from "@/src/api/generated";

export function NodeVersionStatusToReadable({
  status,
}: {
  status?: NodeVersionStatus;
} = {}) {
  if (!status) {
    return "Unknown";
  }
  const mapStatusToReadable = {
    [NodeVersionStatus.NodeVersionStatusFlagged]: "Flagged",
    [NodeVersionStatus.NodeVersionStatusPending]: "Pending",
    [NodeVersionStatus.NodeVersionStatusBanned]: "Banned",
    [NodeVersionStatus.NodeVersionStatusActive]: "Active",
    [NodeVersionStatus.NodeVersionStatusDeleted]: "Deleted",
  };

  return mapStatusToReadable[status] || "Unknown";
}
