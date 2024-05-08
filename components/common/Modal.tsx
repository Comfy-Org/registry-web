// Component.js

import { Button, Label, Modal, TextInput } from 'flowbite-react'
import React from 'react'

export function ModalComponent({ openModal, onCloseModal, setEmail, email }) {
    return (
        <Modal
            show={openModal}
            size="md"
            onClose={onCloseModal}
            popup
            className="bg-gray-800 "
        >
            {/* <Modal.Header className="!bg-gray-800" /> */}
            <Modal.Body
                className="!bg-gray-800 p-8 border border-gray-700 md:p-8 rounded-2xl"
                style={{
                    borderRadius: '10px',
                    backgroundColor: 'rgb(17 24 39)',
                }}
            >
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
                                required
                                className=""
                                style={{
                                    background: '#4B5563',
                                    borderColor: '#4B5563',
                                }}
                                type="text"
                                sizing="sm"
                                value=""
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-bold text-white">
                                Description Optional
                            </label>
                            <TextInput
                                sizing="sm"
                                style={{
                                    background: '#4B5563',
                                    borderColor: '#4B5563',
                                }}
                                id="displayName"
                                className="border-gray-700"
                                placeholder="E.g. Jane Doe "
                                required
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
                                <span className="text-white">Cancel</span>
                            </Button>
                            <Button
                                type="submit"
                                className="w-full ml-1 bg-gray-600 border-gray-600"
                                color="light"
                                size="sm"
                            >
                                <span className="text-gray-700">
                                    Create Secret Key
                                </span>
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal.Body>
        </Modal>
    )
}
