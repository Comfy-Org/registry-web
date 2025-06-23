import { useNextTranslation } from '@/src/hooks/i18n'
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
import { useFromUrlParam } from '../common/HOC/useFromUrl'
import LanguageSwitcher from '../common/LanguageSwitcher'
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
    const { t } = useNextTranslation()
    const fromUrlParam = useFromUrlParam()
    const handleLogIn = () =>
        router.push(`/auth/login?${fromUrlParam}`)
    const handleSignUp = () =>
        router.push(`/auth/signup?${fromUrlParam}`)
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
                    {t('Comfy Registry')}
                </span>
            </Link>
            <div className="flex items-center gap-2 bg-gray-900 md:order-2">
                {isLoggedIn ? (
                    <ProfileDropdown />
                ) : (
                    <>
                        <Button onClick={handleLogIn} color="dark">
                            <span className="text-white text-xs md:text-base">
                                {t('Login')}
                            </span>
                        </Button>

                        <Button onClick={handleSignUp} color="blue">
                            <span className="text-xs md:text-base">
                                {t('Signup')}
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
                <LanguageSwitcher className="mx-2" />
                <Button
                    href={
                        router.locale && router.locale.startsWith('zh')
                            ? 'https://docs.comfy.org/zh-CN'
                            : 'https://docs.comfy.org/registry/overview'
                    }
                    color="blue"
                >
                    {t('Documentation')}
                </Button>

                <NavbarToggle theme={{ icon: 'h-5 w-5 shrink-0' }} />
            </div>
            <NavbarCollapse />
        </Navbar>
    )
}

export default Header
