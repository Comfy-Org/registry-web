import * as React from 'react'
import Registry from '../components/registry/Registry'
import { Breadcrumb } from 'flowbite-react'
import { HiHome } from 'react-icons/hi'

function NodeList() {
    return (
        <div className="p-4">
            <Breadcrumb className="py-4">
                <Breadcrumb.Item href="#" icon={HiHome}>
                    Home
                </Breadcrumb.Item>
            </Breadcrumb>
            
            <Registry />
        </div>
    )
}

export default NodeList
