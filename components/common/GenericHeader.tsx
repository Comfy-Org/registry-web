import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'flowbite-react'
import Link from 'next/link'

const GenericHeader = ({
    title,
    subTitle,
    buttonText,
    buttonColor,
    buttonLink,
}) => {
    return (
        <>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                {title}
            </h1>
            <p className="mt-3 mb-8 font-light text-gray-500 sm:text-xl dark:text-gray-400">
                {subTitle}
            </p>
            <Link href={buttonLink}>
                <Button color={buttonColor}>
                    <span>{buttonText}</span>
                </Button>
            </Link>
        </>
    )
}

GenericHeader.defaultProps = {
    buttonColor: 'blue',
}

export default GenericHeader
