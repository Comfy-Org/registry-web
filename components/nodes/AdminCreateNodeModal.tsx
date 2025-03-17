import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { Button, Label, Modal, Textarea, TextInput } from 'flowbite-react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Node, useAdminCreateNode, useGetNode } from 'src/api/generated'
import { customThemeTModal } from 'utils/comfyTheme'
import { z } from 'zod'

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
// .passthrough() // allow unknown key

export function AdminCreateNodeModal({
    open,
    onClose,
}: {
    open: boolean
    onClose?: () => void
}) {
    const mutation = useAdminCreateNode({
        mutation: {
            onError: (error) => {
                if (error instanceof AxiosError) {
                    toast.error(
                        `Failed to create node. ${error.response?.data?.message}`
                    )
                } else {
                    toast.error('Failed to create node')
                }
            },
            onSuccess: () => {
                toast.success('Node create successfully')
                onClose?.()
            },
        },
    })
    const router = useRouter()
    const schema = z.object({})
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
        watch,
    } = useForm<Node>({ resolver: zodResolver(adminCreateNodeSchema) as any })

    const {
        author,
        category,
        description,
        downloads,
        icon,
        id,
        latest_version,
        license,
        name,
        publisher,
        rating,
        repository,
        status,
        status_detail,
        tags,
    } = getValues()
    const onSubmit = handleSubmit((data: Node) => mutation.mutate({ data }))
    const allPublishers = []
    // const { data: allPublishers } = useListPublishers({})
    const { data: duplicatedNode } = useGetNode(watch('id') ?? '', {
        query: { enabled: !!watch('id') },
    })
    // const { data: similarNodes } = useSearchNodes(
    //     {
    //         include_banned: true,
    //         comfy_node_search: watch('name'),
    //         // search: name,
    //     },
    //     { query: { enabled: !!watch('name') } }
    // )
    // console.log({
    //     allPublishers,
    //     duplicatedNode,
    //     similarNodes,
    // })
    return (
        <Modal
            show={open}
            size="md"
            onClose={onClose}
            popup
            //@ts-ignore
            theme={customThemeTModal}
            dismissible
        >
            <Modal.Body className="!bg-gray-800 p-8 md:px-9 md:py-8 rounded-none">
                <Modal.Header className="!bg-gray-800">
                    <p className="text-white">Create Unclaimed Node</p>
                </Modal.Header>
                <form
                    className="space-y-6 p-2 [&_label]:text-white"
                    onSubmit={onSubmit}
                >
                    <p className="text-white">Add unclaimed node</p>

                    <div>
                        <Label htmlFor="id">ID</Label>
                        <TextInput id="id" {...register('id')} />
                        <span className="text-yellow-300">
                            {id &&
                                duplicatedNode?.id?.replace(
                                    /^(?=.)/,
                                    'Duplicated node: '
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
                        <Label htmlFor="name">Name</Label>
                        <TextInput id="name" {...register('name')} />
                        {/*
                        <span className="text-yellow-300">
                            {name &&
                                similarNodes?.nodes
                                    ?.map((node) => node.name)
                                    .join('')
                                    .replace(
                                        /^(?=.)/,
                                        'Found some similar nodes with name: '
                                    )}
                        </span> */}
                        <span className="text-error">
                            {errors.name?.message}
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
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
                        <Label htmlFor="category">Category</Label>
                        <TextInput id="category" {...register('category')} />
                        <span className="text-error">
                            {errors.category?.message}
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="author">Author</Label>
                        <TextInput id="author" {...register('author')} />
                        <span className="text-error">
                            {errors.author?.message}
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="repository">Repository</Label>
                        <TextInput
                            id="repository"
                            {...register('repository')}
                        />
                        <span className="text-error">
                            {errors.repository?.message}
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="license">License</Label>
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
                            Add
                        </Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    )
}
