import { getAuth } from 'firebase/auth'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import app from 'src/firebase'

const withAuth = (WrappedComponent) => {
    const HOC = (props: JSX.IntrinsicAttributes) => {
        const router = useRouter()
        const auth = getAuth(app)
        const [user, loading, error] = useAuthState(auth)

        useEffect(() => {
            if (!loading && !user) {
                router.push('/auth/login')
            }
        }, [user, router, loading])

        return <WrappedComponent {...props} />
    }

    if (WrappedComponent.getInitialProps) {
        HOC.getInitialProps = WrappedComponent.getInitialProps
    }

    return HOC
}

export default withAuth
