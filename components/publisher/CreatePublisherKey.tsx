import React from 'react'
import { Button } from 'flowbite-react'

const CreatePublisherKey = ({
    handleEditButtonClick,
    handleCreateButtonClick,
}) => {
    return (
        <div className="mt-8">
            <h2 className="flex mb-2 text-xl font-semibold text-white">
                <svg
                    className="w-6 h-6 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"
                    />
                </svg>
                Create an API key
                <span
                    onClick={handleEditButtonClick}
                    className="ml-3 cursor-pointer"
                >
                    +
                </span>
            </h2>
            <Button
                target="__blank"
                color="light"
                className="w-40 mt-6 bg-gray-900 text-gray-400 bg-transparent hover:!bg-transparent focus:!bg-blue focus:!border-none focus:!outline-none"
                onClick={handleCreateButtonClick}
            >
                <span className="text-white"> + Create new key</span>
            </Button>
        </div>
    )
}

export default CreatePublisherKey
