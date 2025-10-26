import { Modal } from 'flowbite-react'
import { useRouter } from 'next/router'
import React from 'react'
import { useNextTranslation } from 'src/hooks/i18n'
import { customThemeTModal } from 'utils/comfyTheme'
import CreatePublisherFormContent from './CreatePublisherFormContent'

type CreatePublisherModalProps = {
  open: boolean
  onCloseModal: () => void
  onSuccess?: () => void
}

const CreatePublisherModal: React.FC<CreatePublisherModalProps> = ({
  open,
  onCloseModal,
  onSuccess,
}) => {
  const { t } = useNextTranslation()
  const router = useRouter()

  const handleSuccess = (username: string) => {
    if (onSuccess) {
      onSuccess()
    } else {
      router.push(`/publishers/${username}`)
    }
  }

  return (
    <Modal
      show={open}
      onClose={onCloseModal}
      size="xl"
      //@ts-ignore
      theme={customThemeTModal}
      popup
      dismissible
    >
      <Modal.Header className="!bg-gray-800 p-6">
        {t('Create Publisher')}
      </Modal.Header>
      <Modal.Body className="!bg-gray-800">
        <CreatePublisherFormContent
          onSuccess={handleSuccess}
          onCancel={onCloseModal}
        />
      </Modal.Body>
    </Modal>
  )
}

export default CreatePublisherModal
