import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Button, Label, Modal, Textarea, TextInput } from 'flowbite-react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { HiPlus, HiDownload } from 'react-icons/hi'
import { toast } from 'react-toastify'
import TOML from 'smol-toml'
import { customThemeTModal } from 'utils/comfyTheme'
import { z } from 'zod'
import {
    getListNodesForPublisherV2QueryKey,
    Node,
    useAdminCreateNode,
    useGetNode,
    useListPublishers,
    useSearchNodes,
} from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'
import { INVALIDATE_CACHE_OPTION, shouldInvalidate } from '../cache-control'

const adminCreateNodeSchema = z.object({
    id: z
        .string()
        .nonempty('ID is required')
        .max(32, 'Max length is 32 chars')
        .min(2, 'Min length is 2 chars')
        .regex(
            /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/,
            'Allow only chars in "a-z A-Z 0-9 or -", start with hyphen and with max 32 chars'
        ),
    // publisher: z.string().nonempty('Publisher is required'),
    name: z.string().nonempty('Name is required'),
    description: z.string().nonempty('Description is required'),
    category: z.string().nonempty('Category is required'),
    author: z.string().nonempty('Author is required'),
    repository: z.string().nonempty('Repository URL is required'),
    license: z
        .string()
        .nonempty('License is required')
        .default('{file="LICENSE"}'),
})

const adminCreateNodeDefaultValues: Partial<
    typeof adminCreateNodeSchema._input
> = {
    license: '{file="LICENSE"}',
}

interface PyProjectData {
    name?: string
    description?: string
    author?: string
    license?: string
}

async function fetchGitHubRepoInfo(
    repoUrl: string
): Promise<PyProjectData | null> {
    try {
        // Parse GitHub URL to extract owner and repo
        const urlMatch = repoUrl.match(
            /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/|$)/
        )
        if (!urlMatch) {
            throw new Error('Invalid GitHub URL format')
        }

        const [, owner, repo] = urlMatch
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/pyproject.toml`

        const response = await fetch(apiUrl)
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('pyproject.toml not found in repository')
            }
            throw new Error(`GitHub API error: ${response.statusText}`)
        }

        const data = await response.json()
        // Validate encoding and base64 content
        if (data.encoding !== 'base64') {
            throw new Error(
                `Unexpected encoding for pyproject.toml: ${data.encoding}`
            )
        }
        // Basic base64 validation regex (allows padding)
        const base64Regex =
            /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/
        if (!base64Regex.test(data.content)) {
            throw new Error('Invalid base64 content in pyproject.toml')
        }
        const content = atob(data.content)

        // Parse TOML using proper TOML library
        const parsed = TOML.parse(content)

        const result: PyProjectData = {}

        // Extract project metadata
        if (parsed.project && typeof parsed.project === 'object') {
            const project = parsed.project as any

            // Extract name
            if (typeof project.name === 'string') {
                result.name = project.name
            }

            // Extract description
            if (typeof project.description === 'string') {
                result.description = project.description
            }

            // Extract author (from authors array or single author field)
            if (Array.isArray(project.authors) && project.authors.length > 0) {
                const firstAuthor = project.authors[0]
                if (
                    typeof firstAuthor === 'object' &&
                    typeof firstAuthor.name === 'string'
                ) {
                    result.author = firstAuthor.name
                }
            } else if (typeof project.author === 'string') {
                result.author = project.author
            }

            // Extract license
            if (typeof project.license === 'string') {
                result.license = project.license
            } else if (
                typeof project.license === 'object' &&
                project.license !== null
            ) {
                const license = project.license as any
                if (typeof license.text === 'string') {
                    result.license = license.text
                }
            }
        }

        return result
    } catch (error) {
        console.error('Error fetching GitHub repo info:', error)
        throw error
    }
}

export function AdminCreateNodeFormModal({
    open,
    onClose,
}: {
    open: boolean
    onClose?: () => void
}) {
    const { t } = useNextTranslation()
    const qc = useQueryClient()
    const [isFetching, setIsFetching] = useState(false)

    const mutation = useAdminCreateNode({
        mutation: {
            onError: (error) => {
                if (error instanceof AxiosError) {
                    toast.error(
                        t('Failed to create node. {{message}}', {
                            message: error.response?.data?.message,
                        })
                    )
                } else {
                    toast.error(t('Failed to create node'))
                }
            },
            onSuccess: () => {
                toast.success(t('Node created successfully'))
            },
        },
    })

    const router = useRouter()
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
        watch,
        reset,
        setValue,
    } = useForm<Node>({
        resolver: zodResolver(adminCreateNodeSchema) as any,
        defaultValues: adminCreateNodeDefaultValues,
    })
    const onSubmit = handleSubmit(async (node: Node) => {
        await mutation.mutateAsync({ data: node }).finally(async () => {
            // Cache-busting invalidation for the newly created node
            qc.prefetchQuery(
                shouldInvalidate.getGetNodeQueryOptions(
                    node.id!,
                    undefined,
                    INVALIDATE_CACHE_OPTION
                )
            )

            // Invalidate the nodes list to refresh the data (non-cached endpoint)
            const publisherId = node.publisher!.id!
            qc.invalidateQueries({
                queryKey: getListNodesForPublisherV2QueryKey(publisherId),
            })
        })
    })

    const handleFetchRepoInfo = async () => {
        const repository = watch('repository')
        if (!repository) {
            toast.error(t('Please enter a repository URL first'))
            return
        }

        setIsFetching(true)
        try {
            const repoData = await fetchGitHubRepoInfo(repository)
            if (repoData) {
                if (repoData.name) setValue('name', repoData.name)
                if (repoData.description)
                    setValue('description', repoData.description)
                if (repoData.author) setValue('author', repoData.author)
                if (repoData.license) setValue('license', repoData.license)

                toast.success(t('Repository information fetched successfully'))
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error'
            toast.error(
                t('Failed to fetch repository information: {{error}}', {
                    error: errorMessage,
                })
            )
        } finally {
            setIsFetching(false)
        }
    }

    const { data: allPublishers } = useListPublishers({
        query: { enabled: false },
    }) // list publishers for unclaimed user

    const { data: duplicatedNode } = useGetNode(
        watch('id') ?? '',
        {},
        {
            query: { enabled: !!watch('id') },
        }
    )
    const { data: similarNodes } = useSearchNodes(
        {
            include_banned: true,
            comfy_node_search: watch('name'),
            // search: name,
        },
        { query: { enabled: !!watch('name') } }
    )

    return (
        <Modal
            show={open}
            size="md"
            onClose={onClose}
            popup
            //@ts-ignore
            theme={customThemeTModal}
            dismissible={false}
        >
            <Modal.Body className="!bg-gray-800 p-8 md:px-9 md:py-8 rounded-none">
                <Modal.Header className="!bg-gray-800">
                    <p className="text-white">{t('Create Unclaimed Node')}</p>
                </Modal.Header>
                <form
                    className="space-y-6 p-2 [&_label]:text-white"
                    onSubmit={onSubmit}
                >
                    <p className="text-white">{t('Add unclaimed node')}</p>

                    <div>
                        <Label htmlFor="repository">
                            {t('Repository URL')}
                        </Label>
                        <div className="flex gap-2">
                            <TextInput
                                id="repository"
                                {...register('repository')}
                                placeholder="https://github.com/user/repo"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleFetchRepoInfo}
                                disabled={isFetching}
                                className="whitespace-nowrap"
                            >
                                <HiDownload className="mr-2 h-4 w-4" />
                                {isFetching
                                    ? t('Fetching...')
                                    : t('Fetch Info')}
                            </Button>
                        </div>
                        <span className="text-error">
                            {errors.repository?.message}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                            {t(
                                'Enter a GitHub repository URL and click "Fetch Info" to automatically fill in details from pyproject.toml'
                            )}
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="id">{t('ID')}</Label>
                        <TextInput id="id" {...register('id')} />
                        <span className="text-warning">
                            {duplicatedNode?.id?.replace(
                                /^(?!$)/,
                                t('Duplicated node: ')
                            )}
                        </span>
                        <span className="text-error">{errors.id?.message}</span>
                    </div>

                    {/* <div>
                        <Label htmlFor="publisher">Publisher</Label>
                        <TextInput
                            id="publisher"
                            {...register('publisher')}
                            list="all-publishers"
                        />
                        <datalist id="all-publishers">
                            {allPublishers?.map((publisher) => (
                                <option value={publisher.id} key={publisher.id}>
                                    {publisher.name}
                                </option>
                            ))}
                        </datalist>
                        <span className="text-error">
                            {errors.publisher?.message}
                        </span>
                    </div> */}

                    <div>
                        <Label htmlFor="name">{t('Name')}</Label>
                        <TextInput id="name" {...register('name')} />
                        <span className="text-warning">
                            {similarNodes?.nodes
                                ?.map((node) => `${node.id} ${node.name}`)
                                .join('\n')
                                .replace(
                                    /^(?!$)/,
                                    t('Warning: found some similar nodes: \n')
                                )}
                        </span>
                        <span className="text-error">
                            {errors.name?.message}
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="description">{t('Description')}</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            rows={5}
                        />
                        <span className="text-error">
                            {errors.description?.message}
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="category">{t('Category')}</Label>
                        <TextInput id="category" {...register('category')} />
                        <span className="text-error">
                            {errors.category?.message}
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="author">{t('Author')}</Label>
                        <TextInput id="author" {...register('author')} />
                        <span className="text-error">
                            {errors.author?.message}
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="license">{t('License')}</Label>
                        <TextInput id="license" {...register('license')} />
                        <span className="text-error">
                            {errors.license?.message}
                        </span>
                    </div>

                    <div>
                        <Button
                            className="w-full"
                            type="submit"
                            aria-busy={mutation.isPending}
                            disabled={mutation.isPending}
                        >
                            <HiPlus className="mr-2 h-5 w-5" />
                            {t('Add')}
                        </Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    )
}
