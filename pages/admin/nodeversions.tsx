import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import {
  Breadcrumb,
  Button,
  Checkbox,
  Label,
  Modal,
  Spinner,
  TextInput,
  Tooltip,
} from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import pMap from "p-map";
import { omit } from "rambda";
import React, { useRef, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { HiBan, HiCheck, HiHome, HiReply } from "react-icons/hi";
import { MdFolderZip, MdOpenInNew } from "react-icons/md";
import { toast } from "react-toastify";
import { NodeVersionStatusToReadable } from "src/mapper/nodeversion";
import { INVALIDATE_CACHE_OPTION, shouldInvalidate } from "@/components/cache-control";
import { CustomPagination } from "@/components/common/CustomPagination";
import withAdmin from "@/components/common/HOC/authAdmin";
import MailtoNodeVersionModal from "@/components/MailtoNodeVersionModal";
import { NodeStatusBadge } from "@/components/NodeStatusBadge";
import { NodeStatusReason, zStatusReason } from "@/components/NodeStatusReason";
import { AdminCreateNodeFormModal } from "@/components/nodes/AdminCreateNodeFormModal";
import { parseJsonSafe } from "@/components/parseJsonSafe";
import {
  getNode,
  NodeVersion,
  NodeVersionStatus,
  useAdminUpdateNodeVersion,
  useGenerateAdminToken,
  useGetUser,
  useListAllNodeVersions,
} from "@/src/api/generated";
import { useNextTranslation } from "@/src/hooks/i18n";
import { isAdminJwtTokenValid, setAdminJwtToken } from "@/src/utils/adminJwtStorage";
import { generateBatchId } from "@/utils/batchUtils";

function NodeVersionList({}) {
  const { t } = useNextTranslation();
  const router = useRouter();
  const [page, setPage] = React.useState<number>(1);
  const [selectedVersions, setSelectedVersions] = useState<{
    [key: string]: boolean;
  }>({});
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchAction, setBatchAction] = useState<string>("");
  const [batchReason, setBatchReason] = useState<string>("");
  const { data: user } = useGetUser();
  const lastCheckedRef = useRef<string | null>(null);
  const generateTokenMutation = useGenerateAdminToken();

  // Contact button, send issues or email to node version publisher
  const [mailtoNv, setMailtoNv] = useState<NodeVersion | null>(null);

  // todo: optimize this, use fallback value instead of useEffect
  React.useEffect(() => {
    if (router.query.page) {
      setPage(parseInt(router.query.page as string));
    }
  }, [router.query.page]);

  // allows filter by search param like /admin/nodeversions?filter=flagged&filter=pending
  const flags = {
    flagged: NodeVersionStatus.NodeVersionStatusFlagged,
    banned: NodeVersionStatus.NodeVersionStatusBanned,
    deleted: NodeVersionStatus.NodeVersionStatusDeleted,
    pending: NodeVersionStatus.NodeVersionStatusPending,
    active: NodeVersionStatus.NodeVersionStatusActive,
  } satisfies Record<string, NodeVersionStatus>; // 'satisfies' requires latest typescript
  const flagColors = {
    all: "success",
    flagged: "warning",
    pending: "info",
    deleted: "failure",
    banned: "failure",
    active: "info",
  };
  const flagNames = {
    all: t("All"),
    flagged: t("Flagged"),
    pending: t("Pending"),
    deleted: t("Deleted"),
    banned: t("Banned"),
    active: t("Active"),
  };
  const allFlags = Object.values(flags).sort();

  const defaultSelectedStatus = [(router.query as any)?.filter ?? Object.keys(flags)]
    .flat()
    .map((flag) => flags[flag]);

  const [selectedStatus, _setSelectedStatus] =
    React.useState<NodeVersionStatus[]>(defaultSelectedStatus);

  const setSelectedStatus = (status: NodeVersionStatus[]) => {
    _setSelectedStatus(status);

    const checkedAll = allFlags.join(",").toString() === [...status].sort().join(",").toString();
    const searchParams = checkedAll
      ? undefined
      : ({
          filter: Object.entries(flags)
            .filter(([flag, s]) => status.includes(s))
            .map(([flag]) => flag),
        } as any);
    const search = new URLSearchParams({
      ...(omit("filter")(router.query) as object),
      ...searchParams,
    })
      .toString()
      .replace(/^(?!$)/, "?");
    const hash = router.asPath.split("#")[1] ? `#${router.asPath.split("#")[1]}` : "";
    router.push(`${router.pathname}${search}${hash}`);
  };

  const [isAdminCreateNodeModalOpen, setIsAdminCreateNodeModalOpen] = useState(false);

  const queryForNodeId = Array.isArray(router.query.nodeId)
    ? router.query.nodeId[0]
    : router.query.nodeId;
  const queryForStatusReason = router.query.statusReason as string;

  const getAllNodeVersionsQuery = useListAllNodeVersions({
    page: page,
    pageSize: 8,
    statuses: selectedStatus,
    include_status_reason: true,
    status_reason: queryForStatusReason || undefined,
    nodeId: queryForNodeId || undefined,
  });

  // todo: also implement this in the backend
  const queryForVersion = router.query.version as string;

  const versions =
    (getAllNodeVersionsQuery.data?.versions || [])?.filter((nv) => {
      if (queryForVersion) return nv.version === queryForVersion;
      return true;
    }) || [];

  const updateNodeVersionMutation = useAdminUpdateNodeVersion();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (getAllNodeVersionsQuery.isError) {
      toast.error(t("Error getting node versions"));
    }
  }, [getAllNodeVersionsQuery, t]);

  async function onReview({
    nodeVersion: nv,
    status,
    message,
    batchId,
  }: {
    nodeVersion: NodeVersion;
    status: NodeVersionStatus;
    message: string;
    batchId?: string; // Optional batchId for batch operations
  }) {
    // Check if JWT token is valid before making the request
    if (!isAdminJwtTokenValid()) {
      // Show toast and automatically generate token
      toast.info(t("Creating JWT token..."));

      try {
        const result = await generateTokenMutation.mutateAsync();
        setAdminJwtToken(result.token, result.expires_at);

        // Recursively retry the operation with the new token
        return await onReview({ nodeVersion: nv, status, message, batchId });
      } catch (error) {
        console.error("Error generating admin JWT token:", error);
        toast.error(t("Failed to generate admin JWT token. Please try again."));
        throw error;
      }
    }

    // parse previous status reason with fallbacks
    const prevStatusReasonJson = parseJsonSafe(nv.status_reason).data;
    const prevStatusReason = zStatusReason.safeParse(prevStatusReasonJson).data;
    const previousHistory = prevStatusReason?.statusHistory ?? [];
    const previousStatus = nv.status ?? "Unknown Status"; // should not happen
    const previousMessage = prevStatusReason?.message ?? nv.status_reason ?? ""; // use raw msg if fail to parse json
    const previousBy = prevStatusReason?.by ?? "admin@comfy.org"; // unknown admin

    // concat history
    const statusHistory = [
      ...previousHistory,
      {
        status: previousStatus,
        message: previousMessage,
        by: previousBy,
      },
    ];
    // console.log('History', statusHistory)

    // updated status reason, with history and optionally batchId
    const reason = zStatusReason.parse({
      message,
      by: user?.email ?? "admin@comfy.org", // if user is not loaded, use 'Admin'
      statusHistory,
      ...(batchId ? { batchId } : {}), // Include batchId if provided
    });

    try {
      await updateNodeVersionMutation.mutateAsync(
        {
          nodeId: nv.node_id!.toString(),
          versionNumber: nv.version!.toString(),
          data: { status, status_reason: JSON.stringify(reason) },
        },
        {
          onSuccess: () => {
            // Cache-busting invalidation for cached endpoints
            queryClient.fetchQuery(
              shouldInvalidate.getListNodeVersionsQueryOptions(
                nv.node_id!.toString(),
                undefined,
                INVALIDATE_CACHE_OPTION,
              ),
            );

            // Regular invalidation for non-cached endpoints
            queryClient.invalidateQueries({
              queryKey: ["/versions"],
            });
          },
          onError: (error) => {
            console.error(t("Error reviewing node version"), error);
            toast.error(
              t("Error reviewing node version {{nodeId}}@{{version}}", {
                nodeId: nv.node_id!,
                version: nv.version!,
              }),
            );
          },
        },
      );
    } catch (error: any) {
      // Check if error is due to missing/expired JWT token
      if (error?.message === "ADMIN_JWT_REQUIRED") {
        // Show toast and automatically generate token
        toast.info(t("Creating JWT token..."));

        try {
          const result = await generateTokenMutation.mutateAsync();
          setAdminJwtToken(result.token, result.expires_at);

          // Recursively retry the operation with the new token
          return await onReview({ nodeVersion: nv, status, message, batchId });
        } catch (tokenError) {
          console.error("Error generating admin JWT token:", tokenError);
          toast.error(t("Failed to generate admin JWT token. Please try again."));
          throw tokenError;
        }
      }
      throw error;
    }
  }

  // For batch operations that include batchId in the status reason
  const onApproveBatch = async (nv: NodeVersion, message: string, batchId: string) => {
    if (!message) return toast.error(t("Please provide a reason"));

    // parse previous status reason with fallbacks
    const prevStatusReasonJson = parseJsonSafe(nv.status_reason).data;
    const prevStatusReason = zStatusReason.safeParse(prevStatusReasonJson).data;
    const previousHistory = prevStatusReason?.statusHistory ?? [];
    const previousStatus = nv.status ?? "Unknown Status"; // should not happen
    const previousMessage = prevStatusReason?.message ?? nv.status_reason ?? ""; // use raw msg if fail to parse json
    const previousBy = prevStatusReason?.by ?? "admin@comfy.org"; // unknown admin

    // concat history
    const statusHistory = [
      ...previousHistory,
      {
        status: previousStatus,
        message: previousMessage,
        by: previousBy,
      },
    ];

    // updated status reason, with history and batchId for future undo-a-batch
    const reason = zStatusReason.parse({
      message,
      by: user?.email ?? "admin@comfy.org",
      statusHistory,
      batchId, // Include the batchId for future undo-a-batch functionality
    });

    await updateNodeVersionMutation.mutateAsync(
      {
        nodeId: nv.node_id!.toString(),
        versionNumber: nv.version!.toString(),
        data: {
          status: NodeVersionStatus.NodeVersionStatusActive,
          status_reason: JSON.stringify(reason),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["/versions"],
          });
        },
        onError: (error) => {
          console.error("Error approving node version in batch", error);
          toast.error(`Error approving node version ${nv.node_id!}@${nv.version!} in batch`);
        },
      },
    );
  };

  const onRejectBatch = async (nv: NodeVersion, message: string, batchId: string) => {
    if (!message) return toast.error(t("Please provide a reason"));

    // parse previous status reason with fallbacks
    const prevStatusReasonJson = parseJsonSafe(nv.status_reason).data;
    const prevStatusReason = zStatusReason.safeParse(prevStatusReasonJson).data;
    const previousHistory = prevStatusReason?.statusHistory ?? [];
    const previousStatus = nv.status ?? "Unknown Status"; // should not happen
    const previousMessage = prevStatusReason?.message ?? nv.status_reason ?? ""; // use raw msg if fail to parse json
    const previousBy = prevStatusReason?.by ?? "admin@comfy.org"; // unknown admin

    // concat history
    const statusHistory = [
      ...previousHistory,
      {
        status: previousStatus,
        message: previousMessage,
        by: previousBy,
      },
    ];

    // updated status reason, with history and batchId for future undo-a-batch
    const reason = zStatusReason.parse({
      message,
      by: user?.email ?? "admin@comfy.org",
      statusHistory,
      batchId, // Include the batchId for future undo-a-batch functionality
    });

    await updateNodeVersionMutation.mutateAsync(
      {
        nodeId: nv.node_id!.toString(),
        versionNumber: nv.version!.toString(),
        data: {
          status: NodeVersionStatus.NodeVersionStatusBanned,
          status_reason: JSON.stringify(reason),
        },
      },
      {
        onSuccess: () => {
          // Cache-busting invalidation for cached endpoints
          queryClient.fetchQuery(
            shouldInvalidate.getListNodeVersionsQueryOptions(
              nv.node_id!.toString(),
              undefined,
              INVALIDATE_CACHE_OPTION,
            ),
          );

          // Regular invalidation for non-cached endpoints
          queryClient.invalidateQueries({
            queryKey: ["/versions"],
          });
        },
        onError: (error) => {
          console.error("Error rejecting node version in batch", error);
          toast.error(`Error rejecting node version ${nv.node_id!}@${nv.version!} in batch`);
        },
      },
    );
  };

  const onApprove = async (nv: NodeVersion, message?: string | null, batchId?: string) => {
    if (nv.status !== NodeVersionStatus.NodeVersionStatusFlagged) {
      toast.error(`Node version ${nv.node_id}@${nv.version} is not flagged, skip`);
      return;
    }

    message ||= prompt(t("Approve Reason:"), t("Approved by admin"));
    if (!message) return toast.error(t("Please provide a reason"));

    await onReview({
      nodeVersion: nv,
      status: NodeVersionStatus.NodeVersionStatusActive,
      message,
      batchId, // Pass batchId to onReview if provided
    });
    toast.success(
      t("{{id}}@{{version}} Approved", {
        id: nv.node_id,
        version: nv.version,
      }),
    );
  };
  const onReject = async (nv: NodeVersion, message?: string | null, batchId?: string) => {
    if (
      nv.status !== NodeVersionStatus.NodeVersionStatusFlagged &&
      nv.status !== NodeVersionStatus.NodeVersionStatusActive
    ) {
      toast.error(`Node version ${nv.node_id}@${nv.version} is not flagged or active, skip`);
      return;
    }
    message ||= prompt(t("Reject Reason:"), t("Rejected by admin"));
    if (!message) return toast.error(t("Please provide a reason"));

    await onReview({
      nodeVersion: nv,
      status: NodeVersionStatus.NodeVersionStatusBanned,
      message,
      batchId, // Pass batchId to onReview if provided
    });
    toast.success(
      t("{{id}}@{{version}} Rejected", {
        id: nv.node_id,
        version: nv.version,
      }),
    );
  };
  const checkIsUndoable = (nv: NodeVersion) =>
    !!zStatusReason.safeParse(parseJsonSafe(nv.status_reason).data).data?.statusHistory?.length;

  const checkHasBatchId = (nv: NodeVersion) => {
    return false; // TODO: remove this after undoBatch is ready
    const statusReason = zStatusReason.safeParse(parseJsonSafe(nv.status_reason).data).data;
    return !!statusReason?.batchId;
  };

  const undoBatch = async (nv: NodeVersion) => {
    const statusReason = zStatusReason.safeParse(parseJsonSafe(nv.status_reason).data).data;
    if (!statusReason?.batchId) {
      toast.error(
        t("No batch ID found for {{id}}@{{version}}", {
          id: nv.node_id,
          version: nv.version,
        }),
      );
      return;
    }

    // todo: search for this batchId and get a list of nodeVersions
    //
    // and show the list for confirmation
    //
    // and undo all of them

    // // Ask for confirmation
    // if (
    //     !confirm(
    //         `Do you want to undo the entire batch with ID: ${statusReason.batchId}?`
    //     )
    // ) {
    //     return
    // }

    // const batchId = statusReason.batchId

    // // Find all node versions in the current view that have the same batch ID
    // const batchNodes = versions.filter((v) => {
    //     const vStatusReason = zStatusReason.safeParse(
    //         parseJsonSafe(v.status_reason).data
    //     ).data
    //     return vStatusReason?.batchId === batchId
    // })

    // if (batchNodes.length === 0) {
    //     toast.error(`No nodes found with batch ID: ${batchId}`)
    //     return
    // }

    // toast.info(
    //     `Undoing batch with ID: ${batchId} (${batchNodes.length} nodes)`
    // )

    // // Process all items in the batch using the undo function
    // await pMap(
    //     batchNodes,
    //     async (nodeVersion) => {
    //         await onUndo(nodeVersion)
    //     },
    //     { concurrency: 5, stopOnError: false }
    // )

    // toast.success(`Successfully undid batch with ID: ${batchId}`)
  };

  const onUndo = async (nv: NodeVersion) => {
    const statusHistory = zStatusReason.safeParse(parseJsonSafe(nv.status_reason).data).data
      ?.statusHistory;
    if (!statusHistory?.length)
      return toast.error(
        t("No status history found for {{id}}@{{version}}", {
          id: nv.node_id,
          version: nv.version,
        }),
      );

    const prevStatus = statusHistory[statusHistory.length - 1].status;
    const by = user?.email; // the user who clicked undo
    if (!by) {
      toast.error(t("Unable to get user email, please reload and try again"));
      return;
    }

    const statusReason = zStatusReason.parse({
      message: statusHistory[statusHistory.length - 1].message,
      by,
      statusHistory: statusHistory.slice(0, -1),
    });

    await updateNodeVersionMutation.mutateAsync(
      {
        nodeId: nv.node_id!.toString(),
        versionNumber: nv.version!.toString(),
        data: {
          status: prevStatus,
          status_reason: JSON.stringify(statusReason),
        },
      },
      {
        onSuccess: () => {
          // Cache-busting invalidation for cached endpoints
          queryClient.fetchQuery(
            shouldInvalidate.getListNodeVersionsQueryOptions(
              nv.node_id!.toString(),
              undefined,
              INVALIDATE_CACHE_OPTION,
            ),
          );

          // Regular invalidation for non-cached endpoints
          queryClient.invalidateQueries({ queryKey: ["/versions"] });

          toast.success(
            t("{{id}}@{{version}} Undone, back to {{status}}", {
              id: nv.node_id,
              version: nv.version,
              status: NodeVersionStatusToReadable({
                status: prevStatus,
              }),
            }),
          );
        },
        onError: (error) => {
          console.error(t("Error undoing node version"), error);
          toast.error(
            t("Error undoing node version {{nodeId}}@{{version}}", {
              nodeId: nv.node_id!,
              version: nv.version!,
            }),
          );
        },
      },
    );
  };

  const handleBatchOperation = () => {
    const selectedKeys = Object.keys(selectedVersions).filter((key) => selectedVersions[key]);
    if (selectedKeys.length === 0) {
      toast.error(t("No versions selected"));
      return;
    }

    // setBatchAction('')
    setIsBatchModalOpen(true);
  };

  const defaultBatchReasons = {
    approve: "Batch approved by admin",
    reject: "Batch rejected by admin",
    undo: "Batch undone by admin",
  };

  const executeBatchOperation = async () => {
    // Process batch operations for the selected versions
    const selectedKeys = Object.keys(selectedVersions).filter((key) => selectedVersions[key]);

    if (selectedKeys.length === 0) {
      toast.error(t("No versions selected"));
      return;
    }

    // Generate a batch ID from the selected nodeId@version strings
    const batchId = generateBatchId(selectedKeys);

    // Format the reason with the batch ID if applicable
    let reason =
      batchReason ||
      (batchAction in defaultBatchReasons
        ? prompt(t("Reason"), t(defaultBatchReasons[batchAction]))
        : "");

    if (!reason) {
      toast.error(t("Please provide a reason"));
      return;
    }

    // Map batch actions to their corresponding handlers
    const batchActions = {
      // For batch approval and rejection, we'll include the batchId in the status reason
      approve: (nv: NodeVersion) => onApprove(nv, reason, batchId),
      reject: (nv: NodeVersion) => onReject(nv, reason, batchId),
      undo: (nv: NodeVersion) => onUndo(nv),
    };

    // Process all selected items using the appropriate action handler
    await pMap(
      selectedKeys,
      async (key) => {
        const [nodeId, version] = key.split("@");
        const nodeVersion = versions.find((nv) => nv.node_id === nodeId && nv.version === version);
        if (!nodeVersion) {
          toast.error(t("Node version {{key}} not found", { key }));
          return;
        }
        const actionHandler = batchActions[batchAction];
        if (!actionHandler) {
          toast.error(
            t("Invalid batch action: {{action}}", {
              action: batchAction,
            }),
          );
          return;
        }
        if (actionHandler) {
          await actionHandler(nodeVersion);
        }
      },
      { concurrency: 5, stopOnError: false },
    );

    setSelectedVersions({});
    setIsBatchModalOpen(false);
    setBatchReason("");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: newPage },
      },
      undefined,
      { shallow: true },
    );
  };

  const BatchOperationBar = () => {
    if (!Object.keys(selectedVersions).some((key) => selectedVersions[key])) return null;
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 z-50 flex justify-between items-center shadow-lg">
        <div className="flex items-center flex-wrap gap-4">
          <Button
            color="gray"
            onClick={() => {
              const allKeys = versions.map((nv) => `${nv.node_id}@${nv.version}`);
              const allSelected = allKeys.every((key) => selectedVersions[key]);
              setSelectedVersions(
                allSelected
                  ? {}
                  : allKeys.reduce(
                      (acc, key) => ({
                        ...acc,
                        [key]: true,
                      }),
                      {},
                    ),
              );
            }}
          >
            {t("Select All")}
          </Button>
          <span className="text-white font-medium mr-4 ml-4">
            {Object.keys(selectedVersions).filter((key) => selectedVersions[key]).length}{" "}
            {t("versions selected")}
          </span>

          <Button
            color="success"
            onClick={() => {
              setBatchAction("approve");
              handleBatchOperation();
            }}
            className="mr-2"
          >
            <HiCheck className="mr-2" /> {t("Batch Approve")}
          </Button>
          <Button
            color="failure"
            onClick={() => {
              setBatchAction("reject");
              handleBatchOperation();
            }}
            className="mr-2"
          >
            <HiBan className="mr-2" /> {t("Batch Reject")}
          </Button>
          <Button
            color="warning"
            onClick={() => {
              setBatchAction("undo");
              handleBatchOperation();
            }}
          >
            <HiReply className="mr-2" /> {t("Batch Undo")}
          </Button>
        </div>
        <Button color="gray" onClick={() => setSelectedVersions({})}>
          {t("Clear Selection")}
        </Button>
      </div>
    );
  };

  if (getAllNodeVersionsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const translatedActionNames = {
    approve: t("approve"),
    reject: t("reject"),
    undo: t("undo"),
  };
  return (
    <div>
      <Breadcrumb className="py-4 px-4">
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
          href="/admin"
          onClick={(e) => {
            e.preventDefault();
            router.push("/admin");
          }}
          className="dark"
        >
          {t("Admin Dashboard")}
        </Breadcrumb.Item>
        <Breadcrumb.Item className="dark">{t("Review Node Versions")}</Breadcrumb.Item>
      </Breadcrumb>
      <BatchOperationBar />
      {/* Batch operation modal */}
      <Modal show={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)}>
        <Modal.Header>
          {t(`Batch {{action}} Node Versions`, {
            action: translatedActionNames[batchAction],
          })}
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 flex flex-wrap gap-2 items-center">
              {t("You are about to {{action}} {{count}} node versions", {
                action: translatedActionNames[batchAction],
                count: Object.keys(selectedVersions).filter((key) => selectedVersions[key]).length,
              })}

              <Tooltip
                content={
                  <ol className="list-decimal list-inside">
                    {Object.keys(selectedVersions)
                      .filter((key) => selectedVersions[key])
                      .map((key) => (
                        <li key={key}>{key}</li>
                      ))}
                  </ol>
                }
                placement="top"
              >
                <Button color="gray" size="xs" pill outline>
                  {t("Details")}
                </Button>
              </Tooltip>
            </p>
            <div>
              <Label
                htmlFor="reason"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                {t("Reason (optional)")}
              </Label>
              <TextInput
                id="reason"
                placeholder={
                  defaultBatchReasons[batchAction] ? t(defaultBatchReasons[batchAction]) : ""
                }
                value={batchReason}
                onChange={(e) => setBatchReason(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={executeBatchOperation}>{t("Confirm")}</Button>
          <Button color="gray" onClick={() => setIsBatchModalOpen(false)}>
            {t("Cancel")}
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-200">{t("Node Versions")}</h1>
        <div className="text-lg font-bold text-gray-200">
          {t("Total Results")} : {getAllNodeVersionsQuery.data?.total}
        </div>
        <form
          className="flex gap-2 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            const inputElement = document.getElementById("filter-node-version") as HTMLInputElement;
            const [nodeId, version] = inputElement.value.split("@");
            const searchParams = new URLSearchParams({
              ...(omit(["nodeId", "version"])(router.query) as object),
              ...(nodeId ? { nodeId } : {}),
              ...(version ? { version } : {}),
            })
              .toString()
              .replace(/^(?!$)/, "?");
            const hash = router.asPath.split("#")[1] ? `#${router.asPath.split("#")[1]}` : "";
            router.push(router.pathname + searchParams + hash);
          }}
        >
          <TextInput
            id="filter-node-version"
            placeholder={t("Filter by nodeId@version")}
            defaultValue={
              queryForNodeId && queryForVersion
                ? `${queryForNodeId}@${queryForVersion}`
                : queryForNodeId
                  ? `${queryForNodeId}`
                  : ""
            }
          />

          <Button color="blue">{t("Search")}</Button>
        </form>
        <form
          className="flex gap-2 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            const inputElement = document.getElementById(
              "filter-status-reason",
            ) as HTMLInputElement;
            const statusReason = inputElement.value.trim();
            const searchParams = new URLSearchParams({
              ...(omit(["statusReason"])(router.query) as object),
              ...(statusReason ? { statusReason } : {}),
            })
              .toString()
              .replace(/^(?!$)/, "?");
            const hash = router.asPath.split("#")[1] ? `#${router.asPath.split("#")[1]}` : "";
            router.push(router.pathname + searchParams + hash);
          }}
        >
          <TextInput
            id="filter-status-reason"
            placeholder={t("Filter by status reason")}
            defaultValue={queryForStatusReason || ""}
          />
          <Button color="blue">{t("Search by Reason")}</Button>
        </form>
        <div className="flex gap-2">
          <Button
            color={selectedStatus.length > Object.keys(flags).length ? flagColors.all : "gray"}
            className={clsx({
              // use tailwind add a filter set bright 50% if not selected
              "brightness-50": !(selectedStatus.length >= Object.keys(flags).length),
              "hover:brightness-100": !(selectedStatus.length >= Object.keys(flags).length),
              "transition-all duration-200": true,
            })}
            onClick={() => setSelectedStatus(Object.values(NodeVersionStatus))}
          >
            {t("All")}
          </Button>

          {Object.entries(flags).map(([flag, status]) => (
            <Button
              key={flag}
              color={flagColors[flag]}
              className={clsx({
                // use tailwind add a filter set bright 50% if not selected
                "brightness-50": !selectedStatus.includes(status),
                "hover:brightness-100": !selectedStatus.includes(status),
                "transition-all duration-200": true,
              })}
              aria-checked={selectedStatus.includes(status)}
              onClick={() => setSelectedStatus([status as NodeVersionStatus])}
            >
              {t(`{{nodeStatus}} Nodes`, {
                nodeStatus: flagNames[flag] || flag,
              })}
            </Button>
          ))}

          <AdminCreateNodeFormModal
            open={isAdminCreateNodeModalOpen}
            onClose={() => setIsAdminCreateNodeModalOpen(false)}
          />
        </div>
      </div>
      {versions
        .map((nv) => ({ ...nv, key: `${nv.node_id}@${nv.version}` }))
        .map(({ key, ...nv }, index) => (
          <div
            key={key}
            className="border border-gray-600 p-4 rounded-md mb-4 flex flex-col justify-start gap-2"
          >
            <div className="flex-1 text-[24px] text-gray-300 flex-2 flex items-center gap-4 pt-2 justify-between">
              <div className="flex gap-2 items-center">
                <Checkbox
                  checked={Boolean(selectedVersions[key])}
                  onChange={(e) => {
                    // hold shift to select multiple
                    if (
                      e.nativeEvent instanceof MouseEvent &&
                      e.nativeEvent.shiftKey &&
                      lastCheckedRef.current
                    ) {
                      const allKeys = versions.map((nv) => `${nv.node_id}@${nv.version}`);
                      const [currentIndex, lastIndex] = [
                        allKeys.indexOf(key),
                        allKeys.indexOf(lastCheckedRef.current),
                      ];
                      if (currentIndex >= 0 && lastIndex >= 0) {
                        const [start, end] = [
                          Math.min(currentIndex, lastIndex),
                          Math.max(currentIndex, lastIndex),
                        ];
                        const newState = !selectedVersions[key];
                        setSelectedVersions((prev) => {
                          const updated = { ...prev };
                          for (let i = start; i <= end; i++) updated[allKeys[i]] = newState;
                          return updated;
                        });
                      }
                    } else {
                      setSelectedVersions((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                      }));
                    }

                    // Update the last checked reference
                    lastCheckedRef.current = key;
                  }}
                  id={`checkbox-${nv.id}`}
                  onKeyDown={(e) => {
                    // allow arrow keys to navigate
                    const dir = {
                      ArrowUp: -1,
                      ArrowDown: 1,
                    }[e.key];
                    if (!dir) return;

                    const nextIndex = (versions.length + index + dir) % versions.length;
                    const nextElement = document.querySelector(
                      `#checkbox-${versions[nextIndex]?.id}`,
                    ) as HTMLInputElement;
                    if (!nextElement) return;

                    e.preventDefault();
                    nextElement.focus();
                    nextElement.parentElement!.parentElement!.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                />
                <Label
                  htmlFor={`checkbox-${nv.id}`}
                  className="text-[24px] text-gray-300 flex gap-2 items-center"
                  // onMouseDown={(e) =>
                  //     e.shiftKey && e.preventDefault()
                  // }
                >
                  {nv.node_id}

                  <span className="text-[16px] text-gray-300">@{nv.version}</span>
                </Label>

                <NodeStatusBadge status={nv.status as NodeVersionStatus} />
              </div>
              <div className="flex gap-2 items-center">
                <Link target="_blank" href={`/nodes/${nv.node_id}`}>
                  <MdOpenInNew className="w-6 h-6" />
                </Link>
                {!!nv.downloadUrl && (
                  <Link target="_blank" href={nv.downloadUrl} title={t("Download Archive")}>
                    <MdFolderZip />
                  </Link>
                )}
                <Link
                  href="javascript:void(0)"
                  onClick={async () => {
                    await getNode(nv.node_id!)
                      .then((e) => e.repository)
                      .then((url) => {
                        window.open(url, "_blank", "noopener,noreferrer");
                      })
                      .catch((e) => {
                        console.error(e);
                        toast.error(
                          t("Error getting node {{id}} repository", {
                            id: nv.node_id,
                          }),
                        );
                      });
                  }}
                >
                  <FaGithub className="w-6 h-6" title={t("Github")} />
                </Link>
              </div>
            </div>
            <NodeStatusReason {...nv} />
            <div className="flex gap-2 justify-between">
              <div className="flex gap-2">
                {/* show approve only flagged/banned node versions */}
                {(nv.status === NodeVersionStatus.NodeVersionStatusPending ||
                  nv.status === NodeVersionStatus.NodeVersionStatusFlagged ||
                  nv.status === NodeVersionStatus.NodeVersionStatusBanned) && (
                  <Button color="blue" className="flex" onClick={() => onApprove(nv)}>
                    {t("Approve")}
                  </Button>
                )}
                {/* show reject only flagged/active node versions */}
                {(nv.status === NodeVersionStatus.NodeVersionStatusPending ||
                  nv.status === NodeVersionStatus.NodeVersionStatusActive ||
                  nv.status === NodeVersionStatus.NodeVersionStatusFlagged) && (
                  <Button color="failure" onClick={() => onReject(nv)}>
                    {t("Reject")}
                  </Button>
                )}

                {checkIsUndoable(nv) && (
                  <Button color="gray" onClick={() => onUndo(nv)}>
                    {t("Undo")}
                  </Button>
                )}

                {checkHasBatchId(nv) && (
                  <Button color="warning" onClick={() => undoBatch(nv)}>
                    {t("Undo Batch")}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="gray" onClick={() => setMailtoNv(nv)}>
                  {t("Contact Publisher")}
                </Button>
                <MailtoNodeVersionModal
                  nodeVersion={mailtoNv ?? undefined}
                  open={!!mailtoNv}
                  onClose={() => setMailtoNv(null)}
                />
              </div>
            </div>
          </div>
        ))}
      <div className="pb-8">
        <CustomPagination
          currentPage={page}
          totalPages={getAllNodeVersionsQuery.data?.totalPages || 1}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export default withAdmin(NodeVersionList);
