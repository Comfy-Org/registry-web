import { Button, Modal, TextInput } from 'flowbite-react'
import React, { useState } from 'react'
import { PublisherKeyModal } from './PublisherKeyModal'
import { customThemeTextInput, customThemeTModal } from 'utils/comfyTheme'

export function PublisherModal({
    openModal,
    onCloseModal,

    setKeyGenerated,
}) {
    const [showSecondModal, setShowSecondModal] = useState(false)

    const openSecondModal = () => setShowSecondModal(true)
    const closeSecondModal = () => setShowSecondModal(false)
    const handleFormSubmit = (e) => {
        e.preventDefault() // Prevent the form from submitting traditionally
        setKeyGenerated(true)
        onCloseModal() // Close the first modal
        openSecondModal() // Open the second modal
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
                                    value=""
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
                                    value=""
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
                                    className="w-full ml-1 bg-gray-600 border-gray-600"
                                    color="light"
                                    size="sm"
                                    onClick={handleFormSubmit}
                                >
                                    <span className="text-xs text-gray-700">
                                        Create Secret Key
                                    </span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal.Body>
            </Modal>
            {showSecondModal && (
                <PublisherKeyModal
                    openModal={showSecondModal}
                    onCloseModal={closeSecondModal}
                />
            )}
        </>
    )
}
