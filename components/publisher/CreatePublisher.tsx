import React from 'react'
import GenericHeader from '../common/GenericHeader'

const CreatePublisher = () => {
    return (
        <section className="h-full mt-8 bg-gray-900 lg:mt-20">
            <GenericHeader
                title="Create a Publisher"
                subTitle="Create a publisher to begin publishing nodes from your CLI."
                buttonText="New Publisher"
                buttonLink="/publisher/create-publisher-form"
                showIcon={true}
            />
        </section>
    )
}

export default CreatePublisher
