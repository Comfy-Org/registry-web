import { useQueryClient } from '@tanstack/react-query'
import { getAuth } from 'firebase/auth'
import { Button } from 'flowbite-react'
import { useEffect } from 'react'
import { useSignOut } from 'react-firebase-hooks/auth'
import { toast } from 'react-toastify'
import { useNextTranslation } from '@/src/hooks/i18n'
import app from '../../src/firebase'

export function useLogout() {
    const auth = getAuth(app)
    const { t } = useNextTranslation()
    const qc = useQueryClient()
    const [signOut, loading, error] = useSignOut(auth)
    const logout = async () => {
        await signOut()
        qc.resetQueries() // Reset all queries, which will refetch data on next access
        qc.clear() // Clear the query cache to remove user data
        window.localStorage.clear() // Clear local storage
        window.sessionStorage.clear() // Clear session storage
    }
    useEffect(() => {
        if (error)
            toast.error(
                t('Logout error: {{error}}', {
                    error: String(error?.message || error),
                })
            )
    }, [error, t])
    return [logout, loading, error] as const
}

const Logout = () => {
    const { t } = useNextTranslation()
    const [onLogout, loading, error] = useLogout()
    return (
        <div className="flex items-center justify-center min-h-screen ">
            <section className="p-4">
                <div className="text-center">
                    <Button onClick={onLogout}>{t('Logout')}</Button>
                    {loading && <p>{t('Logging out...')}</p>}
                </div>
            </section>
        </div>
    )
}

export default Logout
