import { useNextTranslation } from '@/src/hooks/i18n'
import { Badge, Button, Navbar } from 'flowbite-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { FaDiscord, FaGithub } from 'react-icons/fa'
import logoBluePng from '@/src/assets/images/logo_blue.png'
import { useFromUrlParam } from '../common/HOC/useFromUrl'
import LanguageSwitcher from '../common/LanguageSwitcher'
import ThemeSwitcher from '../common/ThemeSwitcher'
import ProfileDropdown from './ProfileDropdown'
import { themeConfig } from '@/utils/themeConfig'

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
            className={`mx-auto p-8 ${themeConfig.header.background}`}
            style={{
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
                <span
                    className={`self-center text-xl font-semibold whitespace-nowrap ${themeConfig.header.text}`}
                >
                    {t('Comfy Registry')}
                </span>
            </Link>
            <div
                className={`flex items-center gap-2 md:order-2 ${themeConfig.header.background}`}
            >
                {isLoggedIn ? (
                    <ProfileDropdown />
                ) : (
                    <>
                        <Button
                            onClick={handleLogIn}
                            size="xs"
                            className={`${themeConfig.button.login} border-0`}
                        >
                            <span className="text-xs md:text-base">
                                {t('Login')}
                            </span>
                        </Button>

                        <Button
                            onClick={handleSignUp}
                            size="xs"
                            className={`${themeConfig.button.signup} border-0`}
                        >
                            <span className="text-xs md:text-base text-white">
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
                    size="xs"
                    className={`${themeConfig.button.documentation} border-0`}
                >
                    <span className="text-xs md:text-base text-white">
                        {t('Documentation')}
                    </span>
                </Button>

                <Badge
                    icon={DiscordIcon}
                    color="gray"
                    href="/discord"
                    size="xs"
                />

                <ThemeSwitcher />
                {/* place in the most-right to reduce ... when switching language  */}
                <LanguageSwitcher />
            </div>
        </Navbar>
    )
}

export default Header
