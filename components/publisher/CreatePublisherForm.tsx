import React, { useState } from 'react'
import { Button, Card, TextInput } from 'flowbite-react'
import { useRouter } from 'next/router'
import { customThemeTextInput } from 'utils/comfyTheme'
import { useCreatePublisher, useValidatePublisher } from 'src/api/generated'
import { toast } from 'react-toastify'
import { isAxiosError } from 'axios'

type CreatePublisherFormProps = {
    onSuccess?: () => void
    onCancel?: () => void
}

const CreatePublisherForm: React.FC<CreatePublisherFormProps> = ({ onSuccess, onCancel }) => {
    const router = useRouter()
    const [username, setUsername] = useState('')

    const [displayName, setDisplayName] = useState('')
    const [publisherValidationError, setPublisherValidationError] = useState('')
    const {
        data,
        isLoading: isLoadingValidation,
        error,
    } = useValidatePublisher({
        username: username,
    })
    const createPublisherMutation = useCreatePublisher()

    const handleSubmit = (event) => {
        event.preventDefault()
        createPublisherMutation.mutate(
            {
                data: {
                    id: username,
                    name: displayName,
                },
            },
            {
                onError: (error) => {
                    toast.error('Could not create publisher. Please try again.')
                },
                onSuccess: () => {
                    toast.success('Publisher created successfully!')
                    if (onSuccess) {
                        onSuccess()
                    } else {
                        router.push(`/publishers/${username}`)
                    }
                },
            }
        )
    }

    React.useEffect(() => {
        if (isAxiosError(error)) {
            setPublisherValidationError(error.response?.data?.message)
        } else {
            setPublisherValidationError('')
        }
    }, [error])

    return (
        <section className="p-0">
            <div className="flex items-center justify-center px-0 py-4 mx-auto">
                <div className="w-full mx-auto shadow sm:max-w-lg">
                    <Card className="p-2 bg-gray-800 border border-gray-700 md:p-6 rounded-2xl">
                        <h1 className="flex text-2xl font-bold text-white ">
                            Create a Publisher
                        </h1>
                        <p className="flex text-sm font-medium text-gray-400 ">
                            Register a publisher to begin distributing custom
                            nodes on Comfy.
                        </p>

                        <form
                            className="mt-4 space-y-4 lg:space-y-6"
                            onSubmit={handleSubmit}
                        >
                            <div>
                                <label className="block mb-1 text-xs font-bold text-white">
                                    Username
                                </label>
                                <TextInput
                                    id="name"
                                    placeholder="E.g. janedoe55"
                                    required
                                    theme={customThemeTextInput}
                                    type="text"
                                    sizing="sm"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    color={
                                        !isLoadingValidation &&
                                        publisherValidationError
                                            ? 'failure'
                                            : 'success'
                                    }
                                    helperText={
                                        <>
                                            {isLoadingValidation && (
                                                <>Checking username...</>
                                            )}
                                            {!isLoadingValidation &&
                                                publisherValidationError && (
                                                    <>
                                                        <span className="font-medium"></span>{' '}
                                                        {
                                                            publisherValidationError
                                                        }
                                                    </>
                                                )}
                                        </>
                                    }
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-bold text-white">
                                    Display Name
                                </label>
                                <TextInput
                                    sizing="sm"
                                    theme={customThemeTextInput}
                                    id="displayName"
                                    className="border-gray-700 "
                                    placeholder="E.g. Jane Doe "
                                    required
                                    type="text"
                                    value={displayName}
                                    onChange={(e) =>
                                        setDisplayName(e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex center gap-4">
                                <Button
                                    type="button"
                                    onClick={onCancel || (() => router.back())}
                                    color="light"
                                    className=" bg-gray-900"
                                >
                                    <span className="text-white">Cancel</span>
                                </Button>
                                <Button
                                    type="submit"
                                    color="blue"
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={
                                        isLoadingValidation ||
                                        !!publisherValidationError
                                    }
                                >
                                    Create
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </section>
    )
}

export default CreatePublisherForm
