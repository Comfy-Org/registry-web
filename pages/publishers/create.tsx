import React from 'react'
import CreatePublisherForm from '../../components/publisher/CreatePublisherForm'
import withAuth from '@/components/common/HOC/withAuth'
import { Breadcrumb } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'

const createpublisher = () => {
    const router = useRouter()
    
    return (
        <div className="p-4">
            <Breadcrumb className="py-4">
                <Breadcrumb.Item
                    href="/"
                    icon={HiHome}
                    onClick={(e) => {
                        e.preventDefault()
                        router.push('/')
                    }}
                >
                    Home
                </Breadcrumb.Item>
                <Breadcrumb.Item>Create Publisher</Breadcrumb.Item>
            </Breadcrumb>
            
            <CreatePublisherForm />
        </div>
    )
}

export default withAuth(createpublisher)
