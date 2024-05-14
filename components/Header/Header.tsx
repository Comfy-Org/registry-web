import React from 'react'
import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
import {
    Avatar,
    Button,
    Navbar,
    NavbarBrand,
    NavbarCollapse,
    NavbarToggle,
} from 'flowbite-react'
import { useRouter } from 'next/router'

interface HeaderProps {
    isLoggedIn?: boolean
    title?: string
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, title }) => {
    const { data: session } = useSession()
    const router = useRouter()

    const handleSignOut = async () => {
        try {
            await signOut({ callbackUrl: '/' })
        } catch (error) {
            console.error('Sign out error:', error)
            // Handle sign-out error
        }
    }

    const userName = session?.user?.name
    const abbreviatedName = userName ? userName.slice(0, 2).toUpperCase() : ''

    return (
        <Navbar
            fluid
            className="p-8 mx-auto"
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
                            <span className="text-base font-medium text-white">
                                {title}
                            </span>
                        </Button>

                        <Button
                            color="light"
                            className="bg-gray-800 w-[50px] h-[50px] rounded-[999px] border-gray-700 outline-none hover:bg-gray-800 "
                        >
                            <span className="text-base font-medium text-white">
                                {abbreviatedName}
                            </span>
                        </Button>
                        <Button onClick={handleSignOut} color="blue">
                            Sign out
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            href="/auth/signin"
                            color="light"
                            className="bg-gray-800 border-none outline-none "
                        >
                            <span className="text-base font-medium text-white">
                                Log in
                            </span>
                        </Button>

                        <Button href="/auth/signup" color="blue">
                            Sign up
                        </Button>
                    </>
                )}
                <NavbarToggle theme={{ icon: 'h-5 w-5 shrink-0' }} />
            </div>
            {/* <NavbarCollapse></NavbarCollapse> */}
        </Navbar>
    )
}

export default Header
