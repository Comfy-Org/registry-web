import { Button, Modal } from 'flowbite-react'
import React from 'react'
import CreatePublisherForm from './CreatePublisherForm'
import { customThemeTModal } from 'utils/comfyTheme'

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
    return (
        <Modal
            show={openModal}
            onClose={onCloseModal}
            size="xl"
            //@ts-ignore
            theme={customThemeTModal}
        >
            <Modal.Header className="border-b border-gray-700">
                Create Publisher
            </Modal.Header>
            <Modal.Body>
                <CreatePublisherForm onSuccess={onSuccess} onCancel={onCloseModal} />
            </Modal.Body>
        </Modal>
    )
}

export default CreatePublisherModal
