import { useNextTranslation } from '@/src/hooks/i18n'
import { Button, Navbar } from 'flowbite-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { FaDiscord, FaGithub } from 'react-icons/fa'
import logoBluePng from '@/src/assets/images/logo_blue.png'
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
    const handleLogIn = () => router.push(`/auth/login?${fromUrlParam}`)
    const handleSignUp = () => router.push(`/auth/signup?${fromUrlParam}`)
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
                    src={logoBluePng}
                    width={36}
                    height={36}
                    className="w-6 h-6 mr-3 sm:w-9 sm:h-9 rounded-lg"
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
                        <Button onClick={handleLogIn} color="dark" size="xs">
                            <span className="text-white text-xs md:text-base">
                                {t('Login')}
                            </span>
                        </Button>

                        <Button onClick={handleSignUp} color="blue" size="xs">
                            <span className="text-xs md:text-base">
                                {t('Signup')}
                            </span>
                        </Button>
                    </>
                )}
                <Button
                    href={
                        router.locale && router.locale.startsWith('zh')
                            ? 'https://docs.comfy.org/zh-CN'
                            : 'https://docs.comfy.org/registry/overview'
                    }
                    color="blue"
                    size="xs"
                >
                    <span className="text-white text-xs md:text-base">
                        {t('Documentation')}
                    </span>
                </Button>

                <a
                    href="https://discord.gg/comfyorg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-1 text-xs font-medium text-gray-500 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    <DiscordIcon className="w-3 h-3" />
                </a>

                {/* place in the most-right to reduce ... when switching language  */}
                <LanguageSwitcher />
            </div>
        </Navbar>
    )
}

export default Header
