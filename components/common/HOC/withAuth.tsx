import { getAuth } from 'firebase/auth'
import { Spinner } from 'flowbite-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import app from 'src/firebase'
import { useFromUrlParam } from './useFromUrl'

const withAuth = (WrappedComponent) => {
    const HOC = (props: JSX.IntrinsicAttributes) => {
        const router = useRouter()
        const auth = getAuth(app)
        const [user, loading, error] = useAuthState(auth)
        const fromUrlParam = useFromUrlParam()

        useEffect(() => {
            if (!loading && !user) router.push(`/auth/login?${fromUrlParam}`)
        }, [router, user, loading, fromUrlParam])

        if (loading)
            return (
                <div className="flex-grow flex justify-center items-center h-[50vh]">
                    <Spinner />
                </div>
            )

        if (!user) return null // show nothing while redirecting to login page

        return <WrappedComponent {...props} />
    }

    if (WrappedComponent.getInitialProps) {
        HOC.getInitialProps = WrappedComponent.getInitialProps
    }

    return HOC
}

export default withAuth
