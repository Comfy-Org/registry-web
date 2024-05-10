import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'
// import { AuthContext } from './AuthContext'; // Assuming you have an AuthContext

const withAuth = (WrappedComponent) => {
    const HOC = (props: JSX.IntrinsicAttributes) => {
        const router = useRouter()
        // const { isLoggedIn } = useContext(AuthContext);
        const isLoggedIn = true
        useEffect(() => {
            if (!isLoggedIn) {
                router.push('/auth/login')
            }
        }, [isLoggedIn, router])

        if (!isLoggedIn) {
            return null
        }

        return <WrappedComponent {...props} />
    }

    if (WrappedComponent.getInitialProps) {
        HOC.getInitialProps = WrappedComponent.getInitialProps
    }

    return HOC
}

export default withAuth
