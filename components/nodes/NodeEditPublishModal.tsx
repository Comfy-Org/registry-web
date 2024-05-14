import { Button, Modal, TextInput } from 'flowbite-react'
import React from 'react'

export function NodeEditPublishModal({ openModal, onCloseModal }) {
    return (
        <Modal
            show={openModal}
            size="sm"
            onClose={onCloseModal}
            popup
            dismissible
        >
            <Modal.Body className="!bg-gray-800 p-8 md:px-9 md:py-8">
                <div className="space-y-6">
                    <h3 className="text-2xl font-medium text-white">
                        Edit publisher
                    </h3>
                    <form className="mt-4 space-y-4 lg:space-y-6">
                        <div>
                            <div>
                                <label className=" mb-1 text-xs font-thin text-white">
                                    Username
                                </label>
                            </div>
                            <div>
                                <label className="mb-1 text-xs font-thin text-white">
                                    @nodesmkaers
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className=" mb-1 text-xs font-thin  text-white">
                                Display Name
                            </label>
                            <TextInput
                                sizing="sm"
                                style={{
                                    background: '#4B5563',
                                    borderColor: '#4B5563',
                                    color: 'white',
                                }}
                                id="displayName"
                                className="border-gray-700 placeholder-white"
                                placeholder="Marker of Nodes "
                                // required
                                type="text"
                                value=""
                            />
                        </div>

                        <div className="flex justify-between">
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
                                className="w-full ml-1 "
                                color="blue"
                                size="sm"
                            >
                                <span className="text-xs text-white">
                                    Save Changes
                                </span>
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal.Body>
        </Modal>
    )
}
