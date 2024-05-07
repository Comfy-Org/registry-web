import { Button, Card, Label, TextInput } from 'flowbite-react'
import Link from 'next/link'
import React from 'react'

const CreatePublisher = () => {
    return (
        <section>
            <div className="flex items-center justify-center max-w-screen-xl px-4 py-16 mx-auto lg:grid lg:grid-cols-12 lg:gap-20">
                <div className="w-full col-span-12 mx-auto shadow bg-white-900 sm:max-w-lg md:mt-0 xl:p-0">
                    <Card className="max-w-md p-2 bg-gray-800 border border-gray-700 md:p-8 rounded-2xl">
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

                        <h1 className="flex text-2xl font-bold text-white ">
                            Create a Publisher
                        </h1>
                        <p className="flex justify-center text-sm font-medium text-gray-400 ">
                            Register a publisher to begin distributing custom
                            nodes on Comfy.
                        </p>

                        <form
                            className="mt-4 space-y-4 lg:space-y-6"
                            action="#"
                        >
                            <div>
                                <label className="block mb-1 text-xs font-bold text-white">
                                    Username
                                </label>
                                <TextInput
                                    id="name"
                                    placeholder="E.g.janedoe55"
                                    required
                                    className=""
                                    style={{
                                        background: '#4B5563',
                                        borderColor: '#4B5563',
                                    }}
                                    type="name"
                                    sizing="sm"
                                    // color="failure"
                                    helperText={
                                        <>
                                            <span className="text-[12px] font-medium text-red-600">
                                                This username is not available.
                                                Please try another one.
                                            </span>{' '}
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
                                    style={{
                                        background: '#4B5563',
                                        borderColor: '#4B5563',
                                    }}
                                    id="displayName"
                                    className="border-gray-700"
                                    placeholder="E.g. Jane Doe "
                                    required
                                    type="displayName"
                                />
                            </div>

                            <div className="flex justify-between ">
                                <Button
                                    href="#"
                                    target="__blank"
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
                                        {' '}
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

export default CreatePublisher
