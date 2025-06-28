import { Button, Modal } from 'flowbite-react'
import React from 'react'
import CreatePublisherForm from './CreatePublisherForm'
import { customThemeTModal } from 'utils/comfyTheme'
import { useNextTranslation } from 'src/hooks/i18n'

type CreatePublisherModalProps = {
    openModal: boolean
    onCloseModal: () => void
    onSuccess?: () => void
}

const CreatePublisherModal: React.FC<CreatePublisherModalProps> = ({
    openModal,
    onCloseModal,
    onSuccess,
}) => {
    const { t } = useNextTranslation()
    
    return (
        <Modal
            show={openModal}
            onClose={onCloseModal}
            size="xl"
            //@ts-ignore
            theme={customThemeTModal}
        >
            <Modal.Header className="border-b border-gray-700">
                {t('Create Publisher')}
            </Modal.Header>
            <Modal.Body>
                <CreatePublisherForm
                    onSuccess={onSuccess}
                    onCancel={onCloseModal}
                />
            </Modal.Body>
        </Modal>
    )
}

export default CreatePublisherModal
