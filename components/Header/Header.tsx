import {
    Button,
    DarkThemeToggle,
    Navbar,
    NavbarBrand,
    NavbarCollapse,
    NavbarToggle,
} from 'flowbite-react'
import Image from 'next/image'

const Header = () => {
    return (
        <Navbar fluid className="mx-auto bg-gray-900 ">
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
                <Button
                    href="/signin"
                    color="light"
                    className="bg-gray-900 border-none outline-none hover:bg-gray-900"
                >
                    <span className="text-white">Login</span>
                </Button>

                <Button
                    href="#"
                    target="__blank"
                    color="light"
                    className="bg-gray-900"
                >
                    <span className="text-white">Your Nodes</span>
                </Button>
                <Button href="#" target="__blank" color="blue">
                    join the Community
                </Button>
                {/* <DarkThemeToggle /> */}
                <NavbarToggle theme={{ icon: 'h-5 w-5 shrink-0' }} />
            </div>
            <NavbarCollapse></NavbarCollapse>
        </Navbar>
    )
}
export default Header
