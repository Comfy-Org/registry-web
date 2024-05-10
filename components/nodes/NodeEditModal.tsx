import React, { useState, useEffect } from 'react'
import { Button, Label, Modal, Textarea, TextInput } from 'flowbite-react'

import nodesLogo from '../../public/images/nodelogo2.png'
import Image from 'next/image'
import { NodeLogoModal } from './NodeLogoModal'
import {
    CustomThemeTextArea,
    customThemeTextInput,
    customThemeTModal,
} from 'utils/comfyTheme'
export function NodeEditModal({ openEditModal, onCloseEditModal, nodeData }) {
    const [nodeName, setNodeName] = useState('')
    const [openLogoModal, setOpenLogoModal] = useState(false)
    const [description, setDescription] = useState('')
    const [license, setLicense] = useState('')
    const [githubLink, setGithubLink] = useState('')

    useEffect(() => {
        // Update state when nodeData prop changes
        if (nodeData) {
            setNodeName(nodeData.name || '')
            setDescription(nodeData.description || '')
            setLicense(nodeData.license || '')
            setGithubLink(nodeData.githubLink || '')
        }
    }, [nodeData])
    const handleOpenLogoModal = () => {
        onCloseEditModal()
        setOpenLogoModal(true)
    }

    const handleCloseLogoModal = () => {
        setOpenLogoModal(false)
    }

    return (
        <>
            <Modal
                show={openEditModal}
                size="3xl"
                onClose={onCloseEditModal}
                popup
                //@ts-ignore
                theme={customThemeTModal}
                dismissible
            >
                <Modal.Body className="!bg-gray-800 p-8 md:px-9 md:py-8 rounded-none ">
                    <Modal.Header className="!bg-gray-800 px-8">
                        <p className="text-white">Edit Node</p>
                    </Modal.Header>
                    <div className="flex justify-evenly">
                        <div className="relative max-w-sm transition-all duration-300 cursor-pointer ">
                            <p className="mb-2 text-sm text-white">
                                Upload Logo
                            </p>
                            <Image
                                src={nodesLogo}
                                alt="icon"
                                width={200}
                                height={200}
                                className=""
                            />
                            <div className="absolute right-[-5px] px-4 text-lg text-white top-[180px]">
                                <div
                                    className="p-2 bg-gray-500 rounded-full"
                                    onClick={handleOpenLogoModal}
                                >
                                    <svg
                                        className="w-[16px] h-[16px] text-white "
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M14 4.182A4.136 4.136 0 0 1 16.9 3c1.087 0 2.13.425 2.899 1.182A4.01 4.01 0 0 1 21 7.037c0 1.068-.43 2.092-1.194 2.849L18.5 11.214l-5.8-5.71 1.287-1.31.012-.012Zm-2.717 2.763L6.186 12.13l2.175 2.141 5.063-5.218-2.141-2.108Zm-6.25 6.886-1.98 5.849a.992.992 0 0 0 .245 1.026 1.03 1.03 0 0 0 1.043.242L10.282 19l-5.25-5.168Zm6.954 4.01 5.096-5.186-2.218-2.183-5.063 5.218 2.185 2.15Z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6 min-w-[350px]">
                            <div>
                                <div className="block mb-2">
                                    <Label
                                        htmlFor="name"
                                        value="Node name"
                                        className="text-white"
                                    />
                                </div>
                                <TextInput
                                    //@ts-ignore
                                    theme={customThemeTextInput}
                                    id="name"
                                    placeholder="Node name"
                                    onChange={(e) =>
                                        setNodeName(e.target.value)
                                    }
                                    value={nodeName}
                                    required
                                />
                            </div>
                            <div className="max-w-md">
                                <div className="block mb-2">
                                    <Label
                                        htmlFor="comment"
                                        value="Description"
                                        className="text-white"
                                    />
                                </div>
                                <Textarea
                                    id="comment"
                                    theme={CustomThemeTextArea}
                                    value={description}
                                    placeholder="Description"
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    required
                                    rows={8}
                                />
                            </div>
                            <div>
                                <div className="block mb-2">
                                    <Label
                                        htmlFor="license"
                                        value="License"
                                        className="text-white"
                                    />
                                </div>
                                <TextInput
                                    id="license"
                                    theme={customThemeTextInput}
                                    placeholder="Github Repository link"
                                    value={license}
                                    onChange={(e) => setLicense(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <div className="block mb-2">
                                    <Label
                                        htmlFor="name"
                                        value="Github Repository link"
                                        className="text-white"
                                    />
                                </div>
                                <TextInput
                                    id="name"
                                    theme={customThemeTextInput}
                                    placeholder="Github Repository link"
                                    value={githubLink}
                                    onChange={(e) =>
                                        setGithubLink(e.target.value)
                                    }
                                    required
                                />

                                <div className="flex mt-5">
                                    <Button
                                        color="gray"
                                        className="w-full text-white bg-gray-800"
                                    >
                                        Decline
                                    </Button>
                                    <Button
                                        color="blue"
                                        className="w-full ml-5"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <NodeLogoModal
                openLogoModal={openLogoModal}
                onCloseModal={handleCloseLogoModal}
            />
        </>
    )
}
