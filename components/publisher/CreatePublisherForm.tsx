import { useState } from 'react'
import { Button, Card, TextInput } from 'flowbite-react'
import { useRouter } from 'next/router'
import { customThemeTextInput } from 'utils/comfyTheme'
import { useCreatePublisher, useValidatePublisher } from 'src/api/generated'
import { toast } from 'react-toastify'

const CreatePublisherForm = () => {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [displayName, setDisplayName] = useState('')

    const { data, isLoading: isLoadingValidation } = useValidatePublisher({
        username: username
    })
    const createPublisherMutation = useCreatePublisher()

    const handleSubmit = (event) => {
        event.preventDefault()
        createPublisherMutation.mutate({
            data: {
                id: username,
                name: displayName
            }
        }, {
            onError: (error) => {
                toast.error("Could not create publisher. Please try again.")
            },
            onSuccess: () => {
                router.push(`/publishers/${username}`)
            }
        })
    }

    const userNameAvailable = isLoadingValidation || (data?.isAvailable !== undefined && data.isAvailable)

    return (
        <section>
            <div className="flex items-center justify-center max-w-screen-xl px-4 py-16 mx-auto lg:grid lg:grid-cols-12 lg:gap-20 h-[90vh]">
                <div className="w-full col-span-12 mx-auto shadow bg-white-900 sm:max-w-lg md:mt-0 xl:p-0">
                    <Card className="max-w-md p-2 bg-gray-800 border border-gray-700 md:p-8 rounded-2xl">
                        <h1 className="flex text-2xl font-bold text-white ">
                            Create a Publisher
                        </h1>
                        <p className="flex justify-center text-sm font-medium text-gray-400 ">
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
                                    color={userNameAvailable ? 'success' : 'failure'}
                                    helperText={
                                        <>
                                            {(userNameAvailable) ?
                                                <>Valid username</> : <><span className="font-medium">Oops!</span> Username already taken! </>
                                            }
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
                                    onClick={() => router.back()}
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
