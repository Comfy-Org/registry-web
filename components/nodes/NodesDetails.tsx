import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'
import { NodesData } from './Nodes'

const NodesDetails = () => {
    const router = useRouter()
    const { id } = router.query

    // Find the node object with the matching id
    const node = NodesData.find((node) => node.id === id)
    console.log(node)
    if (!node) {
        return <div>Node not found</div>
    }

    return (
        <div className="max-w-lg p-8 bg-gray-900 rounded-md">
            <div className="flex items-center mb-4">
                <Image
                    src={node?.image}
                    alt="icon"
                    width={64}
                    height={64}
                    className="rounded-md"
                />
                <div className="ml-4">
                    <h2 className="text-xl font-bold text-white">
                        {node.name}
                    </h2>
                    <p className="text-gray-400">
                        Latest Version:{node.version}{' '}
                    </p>
                    <a href="#" className="text-blue-400 hover:underline">
                        Version history
                    </a>
                    <p>{node.description}</p>
                </div>
            </div>
            <p className="text-gray-400"></p>
            <div className="flex items-center justify-between mt-6">
                <div className="flex items-center">
                    <span className="ml-2 text-gray-400">{node.downloads}</span>
                </div>
                <div className="flex items-center">
                    <span className="ml-2 text-gray-400">{node.rating}</span>
                </div>
            </div>
            <div className="mt-4">
                <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                    Code Repository
                </button>
                <button className="px-4 py-2 ml-2 text-white bg-gray-700 rounded hover:bg-gray-800">
                    Edit details
                </button>
            </div>
        </div>
    )
}

export default NodesDetails
