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

const GithubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <FaGithub {...props} className="text-xl" />
)

const DiscordIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <FaDiscord {...props} className="text-xl" />
)

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
                <div className="flex gap-1">
                    <Image
                        alt="Comfy Logo"
                        src="https://storage.googleapis.com/comfy-assets/logo.png"
                        width={36}
                        height={36}
                        className="h-6 mr-3 sm:h-9"
                    />
                    <span className="self-center text-xl font-semibold text-white whitespace-nowrap">
                        Comfy Registry
                    </span>
                </div>
            </Navbar.Brand>
            <div className="flex items-center gap-2 bg-gray-900 md:order-2">
                <Badge
                    icon={DiscordIcon}
                    color="gray"
                    className="p-3"
                    href="/discord"
                ></Badge>
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
                            className="bg-gray-800 border-none outline-none"
                        >
                            <span className="text-white text-xs md:text-base">
                                Log in
                            </span>
                        </Button>

                        <Button href="/auth/signup" color="blue">
                            <span className="text-xs md:text-base">
                                Sign up
                            </span>
                        </Button>
                    </>
                )}
                <Button
                    href="https://docs.comfy.org/registry/overview"
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
