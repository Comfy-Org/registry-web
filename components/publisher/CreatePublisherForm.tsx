import { useState } from 'react'
import { Button, Card, Label, TextInput } from 'flowbite-react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const CreatePublisherForm = () => {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [displayName, setDisplayName] = useState('')

    const handleSubmit = (event) => {
        event.preventDefault()

        // Use the username as the dynamic parameter for navigation
        router.push(`/publisherdetail/${username}`)
    }

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
                                    className=""
                                    style={{
                                        background: '#4B5563',
                                        borderColor: '#4B5563',
                                    }}
                                    type="text"
                                    sizing="sm"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-bold text-white">
                                    Display Name
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
                                    value={displayName}
                                    onChange={(e) =>
                                        setDisplayName(e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex justify-between ">
                                <Button
                                    type="button"
                                    onClick={() => router.back()}
                                    color="light"
                                    className="w-full bg-gray-900"
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
                                        Create
                                    </span>
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
