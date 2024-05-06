import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'flowbite-react'

const GenericHeader = ({ title, subTitle, buttonText, buttonColor }) => {
    return (
        <>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                {title}
            </h1>
            <p className="mt-3 mb-8 font-light text-gray-500 sm:text-xl dark:text-gray-400">
                {subTitle}
            </p>
            <Button color={buttonColor}>
                <span>{buttonText}</span>
            </Button>
        </>
    )
}

GenericHeader.defaultProps = {
    buttonColor: 'blue',
}

export default GenericHeader
