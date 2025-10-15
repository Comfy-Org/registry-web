import { useNextTranslation } from '@/src/hooks/i18n'
import { Avatar, Dropdown } from 'flowbite-react'
import { useRouter } from 'next/router'
import React from 'react'
import { HiChevronDown } from 'react-icons/hi'
import { useGetUser } from '@/src/api/generated'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser'
import { useLogout } from '../AuthUI/Logout'
import { themeConfig } from '@/utils/themeConfig'

export default function ProfileDropdown() {
    const router = useRouter()
    const { t } = useNextTranslation()
    const [onSignOut, isSignoutLoading, error] = useLogout()
    const { data: user } = useGetUser()

    // Custom theme for dropdown to match our theme configuration
    const customDropdownTheme = {
        floating: {
            base: `z-10 w-fit rounded divide-y divide-gray-100 shadow focus:outline-none ${themeConfig.dropdown.background} ${themeConfig.dropdown.border}`,
            content: 'py-1 text-sm',
            item: {
                base: `flex items-center justify-start py-2 px-4 text-sm cursor-pointer w-full ${themeConfig.dropdown.item}`,
            },
        },
    }

    // // debug
    // return <>{JSON.stringify(useFirebaseUser(), null, 2)}</>
    const [firebaseUser] = useFirebaseUser()
    if (!firebaseUser) return null

    return (
        <Dropdown
            arrowIcon={false}
            inline
            theme={customDropdownTheme}
            label={
                <div className="flex items-center gap-2">
                    <Avatar
                        alt="User avatar"
                        img={firebaseUser.photoURL || undefined}
                        rounded
                        placeholderInitials={
                            firebaseUser.displayName
                                ? firebaseUser.displayName
                                      .charAt(0)
                                      .toUpperCase()
                                : firebaseUser.email
                                  ? firebaseUser.email.charAt(0).toUpperCase()
                                  : 'U'
                        }
                    />
                    <span className="hidden md:inline text-white">
                        {firebaseUser.displayName || firebaseUser.email}
                    </span>
                    <HiChevronDown className="text-white" />
                </div>
            }
        >
            <Dropdown.Header>
                <span className="block text-sm">
                    {firebaseUser.displayName || t('User')}
                </span>
                <span className="block truncate text-sm font-medium">
                    {firebaseUser.email}
                </span>
            </Dropdown.Header>
            <Dropdown.Item onClick={() => router.push('/nodes')}>
                {t('Your Nodes')}
            </Dropdown.Item>
            {user?.isAdmin && (
                <Dropdown.Item onClick={() => router.push('/admin')}>
                    {t('Admin Dashboard')}
                </Dropdown.Item>
            )}
            <Dropdown.Divider />
            <Dropdown.Item onClick={onSignOut}>{t('Logout')}</Dropdown.Item>
        </Dropdown>
    )
}
