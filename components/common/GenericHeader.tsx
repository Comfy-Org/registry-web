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
    showIcon, // New prop to determine whether to show the icon or not
}) => {
    return (
        <>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {title}
            </h1>
            <p className="pt-2 pb-4 font-light text-gray-500 text-lg dark:text-gray-400">
                {subTitle}
            </p>
            <Link href={buttonLink}>
                <Button color={buttonColor} className="flex items-center">
                    {showIcon && (
                        <svg
                            className="w-4 h-4 mr-2"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 12h14m-7 7V5"
                            />
                        </svg>
                    )}
                    <span>{buttonText}</span>
                </Button>
            </Link>
        </>
    )
}

GenericHeader.defaultProps = {
    buttonColor: 'blue',
    showIcon: false, // Default value for the showIcon prop
}

export default GenericHeader
