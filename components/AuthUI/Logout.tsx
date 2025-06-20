import { useQueryClient } from '@tanstack/react-query'
import { getAuth } from 'firebase/auth'
import { Button } from 'flowbite-react'
import { useEffect } from 'react'
import { useSignOut } from 'react-firebase-hooks/auth'
import { toast } from 'react-toastify'
import app from '../../src/firebase'

export function useLogout() {
    const auth = getAuth(app)
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
            toast.error(`Logout error: ${String(error?.message || error)}`)
    }, [error])
    return [logout, loading, error] as const
}

const Logout = () => {
    const [onLogout, loading, error] = useLogout()
    return (
        <div className="flex items-center justify-center min-h-screen ">
            <section className="p-4">
                <div className="text-center">
                    <Button onClick={onLogout}>Logout</Button>
                    {loading && <p>Logging out...</p>}
                </div>
            </section>
        </div>
    )
}

export default Logout
