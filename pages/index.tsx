import { Breadcrumb } from 'flowbite-react'
import { HiHome } from 'react-icons/hi'
import Registry from '../components/registry/Registry'

function NodeList() {
    return (
        <div className="p-4">
            <Breadcrumb className="py-4">
                <Breadcrumb.Item href="#" icon={HiHome} className="dark">
                    Home
                </Breadcrumb.Item>
            </Breadcrumb>

            <Registry />
        </div>
    )
}

export default NodeList
