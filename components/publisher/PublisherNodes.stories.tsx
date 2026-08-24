import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HttpResponse, http } from "msw";
import { expect, waitFor } from "storybook/test";
import PublisherNodes from "@/components/publisher/PublisherNodes";
import {
  ListNodesForPublisherV2200,
  type Node,
  NodeStatus,
  type Publisher,
  PublisherStatus,
} from "@/src/api/generated";
import { attachAuthHeaders } from "@/src/api/mutator/authInterceptor";
import { AXIOS_INSTANCE } from "@/src/api/mutator/axios-instance";
import { CAPI } from "@/src/mocks/apibase";

const TEST_ID_TOKEN = "test-firebase-id-token";

const publisher: Publisher = {
  id: "a-comfy-ui-publisher",
  name: "A ComfyUI Publisher",
  status: PublisherStatus.PublisherStatusActive,
};

const activeNode: Node = {
  id: "active-node",
  name: "Active Node",
  description: "A node in good standing",
  downloads: 120,
  status: NodeStatus.NodeStatusActive,
};

const bannedNode: Node = {
  id: "banned-node",
  name: "Banned Node",
  description: "A node the registry has banned",
  downloads: 3,
  status: NodeStatus.NodeStatusBanned,
  status_detail: "Violated the registry terms",
};

/**
 * Every `/publishers/{id}/nodes/v2` request the story issues, so the play
 * functions can assert on the wire format rather than only on what rendered.
 */
type CapturedRequest = { url: URL; authorization: string | null };
let capturedRequests: CapturedRequest[] = [];

const nodesHandler = http.get(CAPI("/publishers/:publisherId/nodes/v2"), ({ request }) => {
  const url = new URL(request.url);
  capturedRequests.push({ url, authorization: request.headers.get("Authorization") });

  // Mirror the backend: banned nodes are excluded unless the caller opts in.
  const nodes =
    url.searchParams.get("include_banned") === "true" ? [activeNode, bannedNode] : [activeNode];

  const response: ListNodesForPublisherV2200 = {
    nodes,
    total: nodes.length,
    page: 1,
    limit: 12,
    totalPages: 1,
  };
  return HttpResponse.json(response);
});

const waitForRequest = async () => {
  await waitFor(() => expect(capturedRequests.length).toBeGreaterThan(0));
  return capturedRequests[0];
};

const meta: Meta<typeof PublisherNodes> = {
  title: "Components/Publisher/PublisherNodes",
  component: PublisherNodes,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
    msw: { handlers: [nodesHandler] },
  },
  beforeEach: async () => {
    capturedRequests = [];
    // Exercise the production request interceptor so the Authorization header
    // assertions below cover the real code path registered in `_app.tsx`.
    // `getAuth().currentUser` is null under Storybook, so the interceptor falls
    // back to the cached session token.
    sessionStorage.setItem("idToken", TEST_ID_TOKEN);
    const interceptorId = AXIOS_INSTANCE.interceptors.request.use(attachAuthHeaders);
    return () => {
      AXIOS_INSTANCE.interceptors.request.eject(interceptorId);
      sessionStorage.removeItem("idToken");
      capturedRequests = [];
    };
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PublisherNodes>;

/**
 * The authenticated publisher dashboard: opts in to banned nodes and the
 * request carries the caller's Firebase token (without it the backend coerces
 * `include_banned` back to false and the banned rows silently disappear).
 */
export const PublisherDashboard: Story = {
  args: { publisher, include_banned: true },
  play: async ({ canvas }) => {
    const request = await waitForRequest();
    expect(request.url.searchParams.get("include_banned")).toBe("true");
    expect(request.authorization).toBe(`Bearer ${TEST_ID_TOKEN}`);

    // NodesCard renders the name twice (heading + subtitle), hence getAllByText.
    await waitFor(() => expect(canvas.getAllByText("Banned Node").length).toBeGreaterThan(0));
    // The badge itself — exact text match, so "Banned Node" does not satisfy it.
    expect(canvas.getByText("Banned")).toBeInTheDocument();
  },
};

/**
 * A view that has not opted in must not send the flag at all — the backend
 * would ignore it, but the request stays clean.
 */
export const WithoutBannedNodes: Story = {
  args: { publisher },
  play: async ({ canvas }) => {
    const request = await waitForRequest();
    expect(request.url.searchParams.has("include_banned")).toBe(false);

    await waitFor(() => expect(canvas.getAllByText("Active Node").length).toBeGreaterThan(0));
    expect(canvas.queryAllByText("Banned Node")).toHaveLength(0);
    expect(canvas.queryByText("Banned")).not.toBeInTheDocument();
  },
};
