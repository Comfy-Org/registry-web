import { Publisher } from "@/src/api/generated";

// Sample publishers data for mocking
const samplePublishers: Publisher[] = [
  {
    id: "publisher-1",
    name: "ComfyUI Publisher",
    description: "Official ComfyUI publisher",
  },
  {
    id: "publisher-2",
    name: "Community Publisher",
    description: "Community-driven publisher",
  },
  {
    id: "long-publisher-name",
    name: "Very Long Publisher Name That Should Be Handled Properly",
    description: "Testing long names",
  },
];

// Mock implementations for the API hooks
export const useListPublishers = () => ({
  data: samplePublishers,
  isLoading: false,
  error: null,
});

export const useUpdateNode = () => ({
  mutateAsync: () => Promise.resolve(),
  isPending: false,
  error: null,
});

// Re-export everything else from the actual module
export * from "@/src/api/generated";
