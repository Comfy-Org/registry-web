import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    Button,
    Navbar,
    NavbarBrand,
    NavbarCollapse,
    NavbarToggle,
} from 'flowbite-react'

interface HeaderProps {
    isLoggedIn?: boolean
    title?: string
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, title }) => {
    return (
        <Navbar
            fluid
            className="mx-auto p-8"
            style={{
                backgroundColor: 'rgb(17 24 39)',
                paddingLeft: 0,
                paddingRight: 0,
            }}
        >
            <NavbarBrand href="/">
                <Image
                    alt="Flowbite React Logo"
                    src="https://storage.googleapis.com/comfy-assets/logo.png"
                    width={36}
                    height={36}
                    className="h-6 mr-3 sm:h-9"
                />
                <span className="self-center ml-2 text-xl font-semibold text-white whitespace-nowrap">
                    Comfy Registry
                </span>
                <span className="self-center ml-0.5 mt-0.5 p-0.5 text-xs font-semibold text-white whitespace-nowrap bg-blue-500 rounded-md">
                    beta
                </span>
                <Link href="/discord">
                    <a className="ml-2 mt-1">
                        <Image
                            alt="Discord Icon"
                            src="/images/discord.png"
                            width={24}
                            height={24}
                            className="h-6"
                        />
                    </a>
                </Link>

                <Link href="https://github.com/Comfy-Org/registry-web">
                    <a className="ml-1 mt-1">
                        <Image
                            alt="Github Icon"
                            src="/images/github.png"
                            width={24}
                            height={24}
                            className="h-6"
                        />
                    </a>
                </Link>
            </NavbarBrand>
            <div className="flex gap-2 bg-gray-900 md:order-2">
                {isLoggedIn ? (
                    <>
                        <Button
                            href="/nodes"
                            color="light"
                            className="bg-gray-900"
                        >
                            <span className="text-white text-base font-medium">
                                {title}
                            </span>
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            href="/auth/login"
                            color="light"
                            className="bg-gray-800 border-none outline-none "
                        >
                            <span className="text-white text-base font-medium">
                                Log in
                            </span>
                        </Button>

                        <Button href="/auth/signup" color="blue">
                            Sign up
                        </Button>
                    </>
                )}
                <Button
                    href="https://comfydocs.org/registry/overview"
                    color="blue"
                >
                    Documentation
                </Button>

                <NavbarToggle theme={{ icon: 'h-5 w-5 shrink-0' }} />
            </div>
            <NavbarCollapse></NavbarCollapse>
        </Navbar>
    )
}

export default Header
