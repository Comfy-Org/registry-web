import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
    Alert,
    Button,
    Label,
    Modal,
    Textarea,
    TextInput,
} from 'flowbite-react'
import Link from 'next/link'
import { DIES } from 'phpdie'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
    INVALIDATE_CACHE_OPTION,
    shouldInvalidate,
} from '@/components/cache-control'
import {
    AdminUpdateNodeVersionBody,
    NodeVersion,
    useAdminUpdateNodeVersion,
    useGetNode,
} from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'

interface FormData {
    supported_comfyui_frontend_version: string
    supported_comfyui_version: string
    supported_os: string
    supported_accelerators: string
}

interface NodeVersionCompatibilityEditModalProps {
    isOpen: boolean
    onClose: () => void
    nodeVersion: NodeVersion | null
    onSuccess?: () => void
}

export default function NodeVersionCompatibilityEditModal({
    isOpen,
    onClose,
    nodeVersion,
    onSuccess,
}: NodeVersionCompatibilityEditModalProps) {
    const { t } = useNextTranslation()
    const adminUpdateNodeVersion = useAdminUpdateNodeVersion()
    const queryClient = useQueryClient()

    // Fetch node information to get latest version
    const { data: nodeData } = useGetNode(
        nodeVersion?.node_id || '',
        {},
        {
            query: { enabled: !!nodeVersion?.node_id && isOpen },
        }
    )

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<FormData>({
        defaultValues: {
            supported_comfyui_frontend_version:
                nodeVersion?.supported_comfyui_frontend_version || '',
            supported_comfyui_version:
                nodeVersion?.supported_comfyui_version || '',
            supported_os: nodeVersion?.supported_os?.join('\n') || '',
            supported_accelerators:
                nodeVersion?.supported_accelerators?.join('\n') || '',
        },
    })

    // Reset form when nodeVersion changes
    useEffect(() => {
        if (nodeVersion && isOpen) {
            reset({
                supported_comfyui_frontend_version:
                    nodeVersion.supported_comfyui_frontend_version || '',
                supported_comfyui_version:
                    nodeVersion.supported_comfyui_version || '',
                supported_os: nodeVersion.supported_os?.join('\n') || '',
                supported_accelerators:
                    nodeVersion.supported_accelerators?.join('\n') || '',
            })
        }
    }, [nodeVersion, isOpen, reset])

    const normalizeSupportList = (text: string) => {
        return (
            text
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean)
                .toSorted()
                // uniq
                .reduce<string[]>((acc, item) => {
                    if (!acc.includes(item)) acc.push(item)
                    return acc
                }, [])
        )
    }

    const onSubmit = async (data: FormData) => {
        if (!nodeVersion) return

        try {
            await adminUpdateNodeVersion.mutateAsync({
                nodeId:
                    nodeVersion.node_id ||
                    DIES(toast.error.bind(toast), t('Node ID is required')),
                versionNumber:
                    nodeVersion.version ||
                    DIES(
                        toast.error.bind(toast),
                        t('Node Version Number is required')
                    ),
                data: {
                    supported_comfyui_frontend_version:
                        data.supported_comfyui_frontend_version,
                    supported_comfyui_version: data.supported_comfyui_version,
                    supported_os: normalizeSupportList(data.supported_os),
                    supported_accelerators: normalizeSupportList(
                        data.supported_accelerators
                    ),
                },
            })

            // Cache-busting invalidation for cached endpoints
            queryClient.fetchQuery(
                shouldInvalidate.getListNodeVersionsQueryOptions(
                    nodeVersion.node_id!,
                    undefined,
                    INVALIDATE_CACHE_OPTION
                )
            )

            toast.success(t('Updated node version compatibility'))
            onClose()
            onSuccess?.()
        } catch (e) {
            if (e instanceof AxiosError) {
                const errorMessage =
                    e.response?.data?.message || t('Unknown error')
                toast.error(
                    t('Failed to update node version: {{error}}', {
                        error: errorMessage,
                    })
                )
                return
            }
            toast.error(t('Failed to update node version'))
        }
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    if (!nodeVersion) return null

    return (
        <Modal show={isOpen} onClose={handleClose} size="2xl" className="dark">
            <Modal.Header>{t('Edit Node Version Compatibility')}</Modal.Header>
            <form
                onSubmit={handleSubmit(onSubmit)}
                onKeyDown={(e) => {
                    // allow ctrl+Enter to submit the form
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        // check if focus is on a text input or textarea
                        const activeElement = document.activeElement
                        if (
                            activeElement instanceof HTMLInputElement ||
                            activeElement instanceof HTMLTextAreaElement
                        ) {
                            e.preventDefault()
                            handleSubmit(onSubmit)()
                        }
                    }
                }}
            >
                <Modal.Body>
                    <div className="space-y-4">
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                                <span className="font-medium">
                                    {t('Specification Reference:')}
                                </span>{' '}
                                <Link
                                    href="https://docs.comfy.org/registry/specifications#specifications"
                                    target="_blank"
                                    className="underline hover:text-blue-600 dark:hover:text-blue-300"
                                >
                                    {t('pyproject.toml - ComfyUI')}
                                </Link>
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('Node Version')}
                            </Label>
                            <div className="mt-1 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                {nodeVersion.node_id}@{nodeVersion.version}
                            </div>
                        </div>

                        {/* Latest Version Compatibility Info */}
                        {nodeData?.latest_version &&
                            nodeData.latest_version.version !==
                                nodeVersion.version && (
                                <Alert color="info" className="dark">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold">
                                                {t(
                                                    'Latest Version Compatibility Reference: v{{version}}',
                                                    {
                                                        version:
                                                            nodeData
                                                                .latest_version
                                                                .version,
                                                    }
                                                )}
                                            </div>
                                            <Button
                                                size="xs"
                                                color="light"
                                                onClick={() => {
                                                    const latestVersion =
                                                        nodeData.latest_version
                                                    if (latestVersion) {
                                                        reset({
                                                            supported_comfyui_frontend_version:
                                                                latestVersion.supported_comfyui_frontend_version ||
                                                                '',
                                                            supported_comfyui_version:
                                                                latestVersion.supported_comfyui_version ||
                                                                '',
                                                            supported_os:
                                                                latestVersion.supported_os?.join(
                                                                    '\n'
                                                                ) || '',
                                                            supported_accelerators:
                                                                latestVersion.supported_accelerators?.join(
                                                                    '\n'
                                                                ) || '',
                                                        })
                                                        toast.success(
                                                            t(
                                                                'Copied compatibility settings from latest version'
                                                            )
                                                        )
                                                    }
                                                }}
                                            >
                                                {t('Copy from Latest')}
                                            </Button>
                                        </div>
                                        <div className="text-sm space-y-1">
                                            {nodeData.latest_version
                                                .supported_comfyui_frontend_version && (
                                                <div>
                                                    <span className="font-medium">
                                                        {t('ComfyUI Frontend')}:
                                                    </span>{' '}
                                                    {
                                                        nodeData.latest_version
                                                            .supported_comfyui_frontend_version
                                                    }
                                                </div>
                                            )}
                                            {nodeData.latest_version
                                                .supported_comfyui_version && (
                                                <div>
                                                    <span className="font-medium">
                                                        {t('ComfyUI')}:
                                                    </span>{' '}
                                                    {
                                                        nodeData.latest_version
                                                            .supported_comfyui_version
                                                    }
                                                </div>
                                            )}
                                            {nodeData.latest_version
                                                .supported_os &&
                                                nodeData.latest_version
                                                    .supported_os.length >
                                                    0 && (
                                                    <div>
                                                        <span className="font-medium">
                                                            {t('OS')}:
                                                        </span>{' '}
                                                        {nodeData.latest_version.supported_os.join(
                                                            ', '
                                                        )}
                                                    </div>
                                                )}
                                            {nodeData.latest_version
                                                .supported_accelerators &&
                                                nodeData.latest_version
                                                    .supported_accelerators
                                                    .length > 0 && (
                                                    <div>
                                                        <span className="font-medium">
                                                            {t('Accelerators')}:
                                                        </span>{' '}
                                                        {nodeData.latest_version.supported_accelerators.join(
                                                            ', '
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                            {t(
                                                'Consider using these values for better compatibility with the latest version'
                                            )}
                                        </div>
                                    </div>
                                </Alert>
                            )}

                        {nodeData?.latest_version &&
                            nodeData.latest_version.version ===
                                nodeVersion.version && (
                                <Alert color="success" className="dark">
                                    <div className="font-semibold">
                                        {t('This is the latest version')}
                                    </div>
                                    <div className="text-sm mt-1">
                                        {t(
                                            'You are editing compatibility settings for the most recent version of this node'
                                        )}
                                    </div>
                                </Alert>
                            )}

                        <div>
                            <Label htmlFor="comfyui-frontend-version">
                                {t('ComfyUI Frontend Version')}
                            </Label>
                            <Controller
                                name="supported_comfyui_frontend_version"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        id="comfyui-frontend-version"
                                        {...field}
                                        placeholder={t(
                                            'Enter supported ComfyUI frontend version'
                                        )}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Label htmlFor="comfyui-version">
                                {t('ComfyUI Version')}
                            </Label>
                            <Controller
                                name="supported_comfyui_version"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        id="comfyui-version"
                                        {...field}
                                        placeholder={t(
                                            'Enter supported ComfyUI version'
                                        )}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Label htmlFor="supported-os">
                                {t('Supported Operating Systems')}
                            </Label>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {t('Enter one OS per line')}
                            </div>
                            <Controller
                                name="supported_os"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        id="supported-os"
                                        rows={4}
                                        {...field}
                                        placeholder={t(
                                            'e.g.\nWindows\nmacOS\nLinux'
                                        )}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Label htmlFor="supported-accelerators">
                                {t('Supported Accelerators')}
                            </Label>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {t('Enter one accelerator per line')}
                            </div>
                            <Controller
                                name="supported_accelerators"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        id="supported-accelerators"
                                        rows={4}
                                        {...field}
                                        placeholder={t(
                                            'e.g.\nCUDA\nROCm\nMetal\nCPU'
                                        )}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex justify-end space-x-2">
                    <Button
                        color="gray"
                        onClick={handleClose}
                        disabled={adminUpdateNodeVersion.isPending}
                        type="button"
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        color="blue"
                        type="submit"
                        disabled={adminUpdateNodeVersion.isPending || !isDirty}
                        isProcessing={adminUpdateNodeVersion.isPending}
                    >
                        {adminUpdateNodeVersion.isPending
                            ? t('Saving...')
                            : t('Save Changes')}
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}
