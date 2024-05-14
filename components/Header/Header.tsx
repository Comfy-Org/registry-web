import React from 'react'
import Image from 'next/image'
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
            style={{ backgroundColor: 'rgb(17 24 39)' }}
        >
            <NavbarBrand href="/">
                <Image
                    alt="Flowbite React Logo"
                    src="https://flowbite.com/docs/images/logo.svg"
                    width={36}
                    height={36}
                    className="h-6 mr-3 sm:h-9"
                />
                <span className="self-center ml-2 text-xl font-semibold text-white whitespace-nowrap">
                    Comfy
                </span>
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
                <Button href="https://comfydocs.org" color="blue">
                    Documentation
                </Button>
                <NavbarToggle theme={{ icon: 'h-5 w-5 shrink-0' }} />
            </div>
            <NavbarCollapse></NavbarCollapse>
        </Navbar>
    )
}

export default Header
