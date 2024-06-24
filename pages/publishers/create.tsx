import React from 'react'
import CreatePublisherForm from '../../components/publisher/CreatePublisherForm'
import withAuth from '@/components/common/HOC/withAuth'

const createpublisher = () => {
    return (
        <>
            <CreatePublisherForm />
        </>
    )
}

export default withAuth(createpublisher)
