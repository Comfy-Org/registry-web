import { Button, Modal, TextInput } from 'flowbite-react'
import React, { useState } from 'react'
import { CopyAccessTokenModal } from './CopyAccessKeyModal'
import { customThemeTextInput, customThemeTModal } from 'utils/comfyTheme'
import { useCreatePersonalAccessToken } from 'src/api/generated'
import { toast } from 'react-toastify'

type CreateSecretKeyModalProps = {
    openModal: boolean
    onCloseModal: () => void
    onCreationSuccess: () => void
    publisherId: string
}

export const CreateSecretKeyModal: React.FC<CreateSecretKeyModalProps> = ({
    openModal,
    onCloseModal,
    onCreationSuccess,
    publisherId,
}) => {
    const [showSecondModal, setShowSecondModal] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const createAccessTokenMutation = useCreatePersonalAccessToken()
    const openSecondModal = () => setShowSecondModal(true)
    const closeSecondModal = () => setShowSecondModal(false)
    const handleFormSubmit = (e) => {
        e.preventDefault()

        createAccessTokenMutation.mutate(
            {
                publisherId,
                data: {
                    name,
                    description,
                },
            },
            {
                onError: (error) => {
                    toast.error('Failed to create secret key')
                },
                onSuccess: () => {
                    toast.success('Secret key created')
                    onCloseModal()
                    openSecondModal()
                    setName('')
                    setDescription('')
                    onCreationSuccess()
                },
            }
        )
    }

    return (
        <>
            <Modal
                show={openModal}
                size="sm"
                onClose={onCloseModal}
                popup
                //@ts-ignore
                theme={customThemeTModal}
                dismissible
            >
                {/* <Modal.Header className="!bg-gray-800" /> */}
                <Modal.Body className="!bg-gray-800 p-8  md:px-9 md:py-8 ">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-medium text-white">
                            Create a new secret key
                        </h3>
                        <form className="mt-4 space-y-4 lg:space-y-6">
                            <div>
                                <label className="block mb-1 text-xs font-bold text-white">
                                    Name
                                </label>
                                <TextInput
                                    id="name"
                                    placeholder="E.g. janedoe55"
                                    // required
                                    theme={customThemeTextInput}
                                    type="text"
                                    sizing="sm"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-bold text-white">
                                    Description{' '}
                                    <span className="text-gray-400">
                                        Optional
                                    </span>
                                </label>
                                <TextInput
                                    sizing="sm"
                                    theme={customThemeTextInput}
                                    id="displayName"
                                    placeholder="E.g. Jane Doe "
                                    // required
                                    type="text"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex justify-between ">
                                <Button
                                    onClick={onCloseModal}
                                    type="button"
                                    color="light"
                                    className="w-full bg-gray-800 hover:!bg-gray-800"
                                >
                                    <span className="text-xs text-white">
                                        Cancel
                                    </span>
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full bg-gray-800 hover:!bg-gray-800"
                                    color="light"
                                    size="sm"
                                    onClick={handleFormSubmit}
                                    disabled={
                                        createAccessTokenMutation.isPending ||
                                        !name
                                    }
                                >
                                    <span className="text-xs text-white hover:text-gray-500">
                                        Create Secret Key
                                    </span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal.Body>
            </Modal>
            {showSecondModal && (
                <CopyAccessTokenModal
                    openModal={showSecondModal}
                    onCloseModal={closeSecondModal}
                    accessToken={createAccessTokenMutation.data?.token || ''}
                />
            )}
        </>
    )
}
