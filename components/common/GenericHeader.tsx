import { Button } from 'flowbite-react'
import Link from 'next/link'
import React from 'react'

interface Props {
    title: string
    subTitle: string
    buttonText: string
    buttonColor?: string
    buttonLink?: string
    showIcon?: boolean
}

const GenericHeader: React.FC<Props> = ({
    title,
    subTitle,
    buttonText,
    buttonColor = 'blue',
    buttonLink = '',
    showIcon = false,
}) => {
    return (
        <>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-black dark:text-white sm:text-4xl">
                {title}
            </h1>
            <p className="pt-2 pb-4 font-light text-gray-700 text-lg dark:text-gray-400">
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
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
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

export default GenericHeader
