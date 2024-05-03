import { Badge, Button, Card } from 'flowbite-react'
import React from 'react'

const DrCard = () => {
    return (
        <Card className="bg-gray-800 lg:mt-20 xs:mt-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">
                NodesOrg
            </h2>
            <p className="mb-2 text-sm text-gray-400">Created 5/20/24</p>
            <p className="text-sm font-bold text-gray-300 ">MEMBERS</p>
            <p className="text-sm text-gray-400 ">Robin Huang</p>
            <p className="text-sm text-gray-400">Yoland Yan</p>
            <div className="flex items-center justify-center">
                {' '}
                <Button color="blue" className="w-full ">
                    <span className="ml-2">View Nodes</span>
                </Button>
            </div>
        </Card>
    )
}

export default DrCard
