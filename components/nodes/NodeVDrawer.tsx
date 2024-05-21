import React, { useState } from 'react'
import { NodeVersion, useUpdateNodeVersion } from 'src/api/generated'
import { formatRelativeDate } from './NodeDetails'
import { toast } from 'react-toastify'
import { Button } from 'flowbite-react'
type NodeVDrawerProps = {
    version: NodeVersion
    isDrawerOpen: boolean
    toggleDrawer: () => void
    publisherId?: string // Means don't deprecate version.
    canEdit?: boolean
    nodeId: string
}

const NodeVDrawer: React.FC<NodeVDrawerProps> = ({
    publisherId,
    nodeId,
    version,
    isDrawerOpen,
    toggleDrawer,
    canEdit = false,
}) => {
    const [isVersionAvailable, setIsVersionAvailable] = useState(true)
    const updateNodeVersionMutation = useUpdateNodeVersion()
    const handleToggle = () => {
        if (!version || !version.id) {
            toast.error('Version not found')
            return
        }
        if (!publisherId) {
            toast.error('Cannot Update')
            return
        }
        setIsVersionAvailable(!isVersionAvailable)
        updateNodeVersionMutation.mutate(
            {
                versionId: version.id,
                publisherId: publisherId,
                nodeId: nodeId,
                data: {
                    deprecated: !isVersionAvailable,
                },
            },
            {
                onError: (error) => {
                    toast.error('Could not update version. Please try again.')
                },
                onSuccess: () => {
                    toast.success('Version updated successfully')
                },
            }
        )
    }

    return (
        <>
            <div
                id="drawer-create-product-default"
                className={`fixed top-0 right-0 z-40 w-full max-w-2xl h-screen py-20 px-12 overflow-y-auto transition-transform ${
                    isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                } bg-gray-800`}
                aria-labelledby="drawer-label"
                aria-hidden={!isDrawerOpen}
            >
                <div>
                    <button
                        type="button"
                        onClick={toggleDrawer}
                        aria-controls="drawer-create-product-default"
                        className="text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                        <svg
                            aria-hidden="true"
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    </button>
                </div>
                <div>
                    <h5
                        id="drawer-label"
                        className="inline-flex items-center mb-6 text-xl font-semibold text-white "
                    >
                        {version ? version.version : ''}{' '}
                        <span
                            className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ml-2 ${isVersionAvailable ? 'bg-green-900 text-green-800' : 'bg-red-900 text-red-800'} dark:bg-${isVersionAvailable ? 'green-900 text-green-300' : 'red-900 text-red-300'}`}
                        >
                            <span
                                className={`w-2 h-2 ${isVersionAvailable ? 'bg-green-500' : 'bg-red-500'} rounded-full me-1`}
                            ></span>
                            <span className="text-white">
                                {isVersionAvailable ? 'Live' : 'Deprecated'}
                            </span>
                        </span>
                    </h5>
                    {version.createdAt && (
                        <p className="text-gray-400">
                            Released {formatRelativeDate(version.createdAt)}
                        </p>
                    )}
                    {version.downloadUrl && (
                        <Button className="flex-shrink-0 px-4 text-white bg-blue-500 rounded whitespace-nowrap text-[16px] mt-5">
                            <a href={version.downloadUrl}>
                                Download Version {version.version}
                            </a>
                        </Button>
                    )}
                    <hr className="h-px my-8 bg-gray-700 border-0"></hr>

                    <div className="space-y-4">
                        {version && (
                            <div>
                                <h2 className="font-bold">Updates</h2>
                                <p>{version.changelog}</p>
                            </div>
                        )}
                    </div>
                    <hr className="h-px my-8 bg-gray-700 border-0"></hr>
                </div>

                {canEdit && (
                    <div className="flex items-center py-4 rounded-lg">
                        <label className="inline-flex items-center mb-5 cursor-pointer">
                            <input
                                type="checkbox"
                                value=""
                                className="sr-only peer"
                                onClick={handleToggle}
                            />
                            <div className=" mt-[10px] relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>

                        <div className="ml-2 text-white">
                            <p className="font-semibold ">Deprecate version</p>
                            <p className="text-xs text-gray-400">
                                Users will see a warning prompting them to use
                                another version.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default NodeVDrawer
