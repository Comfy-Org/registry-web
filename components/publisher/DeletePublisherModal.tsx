import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { customThemeTModal } from "utils/comfyTheme";
import { useDeletePublisher } from "@/src/api/generated";
import { useNextTranslation } from "@/src/hooks/i18n";

type DeletePublisherModalProps = {
  openDeleteModal: boolean;
  onClose: () => void;
  publisherId: string;
};

export const DeletePublisherModal: React.FC<DeletePublisherModalProps> = ({
  openDeleteModal,
  onClose,
  publisherId,
}) => {
  const { t } = useNextTranslation();
  const mutation = useDeletePublisher({});
  const router = useRouter();
  const qc = useQueryClient();
  const handleSubmit = async () => {
    return mutation.mutate(
      {
        publisherId: publisherId,
      },
      {
        onError: (error) => {
          if (error instanceof AxiosError) {
            toast.error(
              t(`Failed to delete publisher. {{message}}`, {
                message: error.response?.data?.message,
              }),
            );
          } else {
            toast.error(t("Failed to delete publisher"));
          }
        },
        onSuccess: () => {
          toast.success(t("Publisher deleted successfully"));
          onClose();
          router.push("/nodes");
        },
      },
    );
  };

  const validateText = publisherId;
  const [confirmationText, setConfirmationText] = useState("");
  return (
    <Modal
      show={openDeleteModal}
      size="md"
      onClose={onClose}
      popup
      //@ts-ignore
      theme={customThemeTModal}
      dismissible
    >
      <Modal.Body className="!bg-gray-800 p-8 md:px-9 md:py-8 rounded-none">
        <Modal.Header className="!bg-gray-800">
          <p className="text-white">{t("Delete Publisher")}</p>
        </Modal.Header>
        <form
          className="space-y-6 p-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSubmit();
          }}
        >
          <p className="text-white">
            {t("Are you sure you want to delete this publisher? This action cannot be undone.")}
          </p>
          <div>
            <Label className="text-white">
              {t("Type")} <code className="text-red-300 inline">{validateText}</code>{" "}
              {t("to confirm")}:
            </Label>
            <TextInput
              className="input"
              name="confirmation"
              onChange={(e) => setConfirmationText(e.target.value)}
            />
          </div>
          <div className="flex">
            <Button color="gray" className="w-full text-white bg-gray-800" onClick={onClose}>
              {t("Cancel")}
            </Button>
            <Button
              color="red"
              className="w-full ml-5"
              type="submit"
              disabled={validateText !== confirmationText}
            >
              {t("Delete")}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};
