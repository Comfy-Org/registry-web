import {
    Badge,
    Button,
    Navbar,
    NavbarCollapse,
    NavbarToggle,
} from 'flowbite-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { FaDiscord, FaGithub } from 'react-icons/fa'
import { getFromUrlSearchParam } from '../common/HOC/getFromUrlSearchParam'
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
    const router = useRouter()
    const handleLogIn = () =>
        router.push(`/auth/login?${getFromUrlSearchParam()}`)
    const handleSignUp = () =>
        router.push(`/auth/signup?${getFromUrlSearchParam()}`)
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
            <Link href="/" className="flex gap-1">
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
            </Link>
            <div className="flex items-center gap-2 bg-gray-900 md:order-2">
                {isLoggedIn ? (
                    <ProfileDropdown />
                ) : (
                    <>
                        <Button onClick={handleLogIn} color="dark">
                            <span className="text-white text-xs md:text-base">
                                Log in
                            </span>
                        </Button>

                        <Button onClick={handleSignUp} color="blue">
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
            <NavbarCollapse />
        </Navbar>
    )
}

export default Header
