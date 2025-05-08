import { getAuth } from 'firebase/auth'
import { Avatar, Dropdown } from 'flowbite-react'
import { useRouter } from 'next/router'
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { HiChevronDown } from 'react-icons/hi'
import { useGetUser } from 'src/api/generated'
import app from '../../src/firebase'

const ProfileDropdown: React.FC = () => {
    const router = useRouter()
    const auth = getAuth(app)
    const [firebaseUser] = useAuthState(auth)
    const { data: user } = useGetUser()
    
    if (!firebaseUser) return null

    const handleLogout = async () => {
        await auth.signOut()
        router.push('/auth/logout')
    }

    return (
        <Dropdown
            arrowIcon={false}
            inline
            label={
                <div className="flex items-center gap-2">
                    <Avatar
                        alt="User avatar"
                        img={firebaseUser.photoURL || undefined}
                        rounded
                        placeholderInitials={
                            firebaseUser.displayName
                                ? firebaseUser.displayName.charAt(0).toUpperCase()
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
                <span className="block text-sm">{firebaseUser.displayName || 'User'}</span>
                <span className="block truncate text-sm font-medium">
                    {firebaseUser.email}
                </span>
            </Dropdown.Header>
            <Dropdown.Item onClick={() => router.push('/nodes')}>
                Your Nodes
            </Dropdown.Item>
            {user?.isAdmin && (
                <Dropdown.Item onClick={() => router.push('/admin')}>
                    Admin Dashboard
                </Dropdown.Item>
            )}
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
        </Dropdown>
    )
}

export default ProfileDropdown