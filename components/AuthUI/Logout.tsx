import { useQueryClient } from '@tanstack/react-query'
import { getAuth } from 'firebase/auth'
import { Button } from 'flowbite-react'
import { useSignOut } from 'react-firebase-hooks/auth'
import app from '../../src/firebase'

const Logout = () => {
    const auth = getAuth(app)
    const [signOut, user, loading] = useSignOut(auth)
    const qc = useQueryClient()
    const onLogout = async () => {
        qc.clear() // Clear the query cache to remove user data
        window.localStorage.clear() // Clear local storage
        window.sessionStorage.clear() // Clear session storage
        await signOut()
    }
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
