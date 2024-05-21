import { useSignOut } from 'react-firebase-hooks/auth'
import app from '../../src/firebase'
import { getAuth } from 'firebase/auth'
import { Button } from 'flowbite-react'
import { useRouter } from 'next/router'

const Logout = () => {
    const auth = getAuth(app)
    const [signOut, user, loading] = useSignOut(auth)
    const router = useRouter()

    return (
        <div className="flex items-center justify-center min-h-screen ">
            <section className="p-4">
                <div className="text-center">
                    <Button
                        onClick={async () => {
                            await signOut()
                            router.push('/')
                        }}
                    >
                        Logout
                    </Button>
                    {loading && <p>Logging out...</p>}
                </div>
            </section>
        </div>
    )
}

export default Logout
