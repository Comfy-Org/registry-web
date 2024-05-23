import React from 'react'
import Image from 'next/image'
import {
    Badge,
    Button,
    Navbar,
    NavbarCollapse,
    NavbarToggle,
} from 'flowbite-react'
import { FaDiscord } from 'react-icons/fa'
import { FaGithub } from 'react-icons/fa'

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
            <Navbar.Brand href="/">
                <div className="flex items-center gap-1">
                    <Image
                        alt="Flowbite React Logo"
                        src="https://storage.googleapis.com/comfy-assets/logo.png"
                        width={36}
                        height={36}
                        className="h-6 mr-3 sm:h-9"
                    />
                    <span className="self-center text-xl font-semibold text-white whitespace-nowrap">
                        Comfy Registry
                    </span>
                    <span className="self-center mt-0.5 p-0.5 text-xs font-semibold text-white whitespace-nowrap bg-blue-500 rounded-md">
                        beta
                    </span>
                    <Badge
                        icon={FaDiscord}
                        color="gray"
                        href="/discord"
                    ></Badge>
                    <Badge
                        icon={FaGithub}
                        color="gray"
                        href="https://github.com/Comfy-Org/registry-web"
                    ></Badge>
                </div>
            </Navbar.Brand>
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
