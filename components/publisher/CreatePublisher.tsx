import { Button, Card, Label, TextInput } from 'flowbite-react'
import Link from 'next/link'
import React from 'react'

const CreatePublisher = () => {
    return (
        <section className="h-screen bg-gray-900 ">
            <div className="flex items-center justify-center max-w-screen-xl px-4 py-16 mx-auto lg:grid lg:grid-cols-12 lg:gap-20">
                <div className="w-full col-span-12 mx-auto shadow bg-white-900 sm:max-w-lg md:mt-0 xl:p-0">
                    <Card className="p-10 bg-white rounded-2xl">
                        <div className="mb-6 text-center lg:hidden">
                            <a
                                href="#"
                                className="inline-flex items-center text-2xl font-semibold text-white lg:hidden"
                            >
                                <img
                                    className="w-8 h-8 mr-2"
                                    src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
                                    alt="logo"
                                />
                            </a>
                        </div>

                        <h1 className="flex text-2xl font-bold text-gray-900 dark:text-white ">
                            Create a Publisher
                        </h1>
                        <p className="flex justify-center text-sm font-medium text-gray-700 ">
                            Register a publisher to begin distributing custom
                            nodes on Comfy.
                        </p>

                        <form
                            className="mt-4 space-y-4 lg:space-y-6"
                            action="#"
                        >
                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-700">
                                    Username
                                </label>
                                <TextInput
                                    id="name"
                                    placeholder="E.g.janedoe55"
                                    required
                                    type="name"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-700">
                                    Display Name
                                </label>
                                <TextInput
                                    id="displayName"
                                    placeholder="E.g. Jane Doe"
                                    required
                                    type="displayName"
                                />
                            </div>

                            <Button
                                type="submit"
                                color="blue"
                                className="w-full"
                            >
                                Create a Publisher
                            </Button>

                            <div className="flex justify-center ">
                                <Button
                                    type="submit"
                                    outline
                                    color="light"
                                    className="w-full text-white transition-colors border border-gray-300 rounded-md hover:text-black hover:bg-transparent hover:border-gray-300"
                                >
                                    <span> Cancel</span>
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </section>
    )
}

export default CreatePublisher
