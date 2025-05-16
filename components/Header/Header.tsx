import {
    Badge,
    Button,
    Navbar,
    NavbarCollapse,
    NavbarToggle,
} from 'flowbite-react'
import Image from 'next/image'
import React from 'react'
import { FaDiscord, FaGithub } from 'react-icons/fa'
import ProfileDropdown from './ProfileDropdown'

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
                        className="w-6 h-6 mr-3 sm:w-9 sm:h-9"
                    />
                    <span className="self-center text-xl font-semibold text-white whitespace-nowrap">
                        Comfy Registry
                    </span>
                </div>
            </Navbar.Brand>
            <div className="flex items-center gap-2 bg-gray-900 md:order-2">
                {isLoggedIn ? (
                    <ProfileDropdown />
                ) : (
                    <>
                        <Button
                            href={`/auth/login?fromUrl=${window.location.pathname}`}
                            color="light"
                            className="bg-gray-800 border-none outline-none"
                        >
                            <span className="text-white text-xs md:text-base">
                                Log in
                            </span>
                        </Button>

                        <Button
                            href={`/auth/signup?fromUrl=${
                                window.location.pathname
                            }`}
                            color="blue"
                        >
                            <span className="text-xs md:text-base">
                                Sign up
                            </span>
                        </Button>
                    </>
                )}
                <Badge
                    icon={DiscordIcon}
                    color="gray"
                    className="p-3"
                    href="/discord"
                ></Badge>
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
