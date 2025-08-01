import { Spinner } from 'flowbite-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useGetUser } from '@/src/api/generated'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser'
import { useFromUrlParam } from './useFromUrl'

/**
 * Admin dashboard HOC
 * case User is not logged in: show 401, and then redirect to login page
 * case User is logged in but not admin: show 403 page
 * case User is logged in and admin: show the page
 *
 * this HOC component should be used in page level, since h-[50vh] in loading spinner settle
 */
const withAdmin = (WrappedComponent) => {
    const HOC = (props: JSX.IntrinsicAttributes) => {
        const router = useRouter()
        const fromUrlParam = useFromUrlParam()

        // if firebaseUser is signed out, redirect to login page
        const [firebaseUser, firebaseUserLoading] = useFirebaseUser()
        useEffect(() => {
            if (!firebaseUserLoading && !firebaseUser) {
                router.push(`/auth/login?${fromUrlParam}`)
            }
        }, [router, firebaseUser, firebaseUserLoading, fromUrlParam])

        const { data: user, isLoading } = useGetUser({})
        useEffect(() => {
            if (!isLoading && !user) router.push(`/auth/login?${fromUrlParam}`)
        }, [router, user, isLoading, fromUrlParam])

        if (isLoading)
            return (
                <div className="flex-grow flex justify-center items-center h-[50vh]">
                    <Spinner />
                </div>
            )

        if (!user) return null // show nothing while redirecting to login page

        if (!user.isAdmin) {
            return (
                <div className="text-white dark:text-white">
                    403 Forbidden: You have no permission to this page.
                </div>
            )
        }

        return <WrappedComponent {...props} />
    }

    if (WrappedComponent.getInitialProps) {
        HOC.getInitialProps = WrappedComponent.getInitialProps
    }

    return HOC
}

export default withAdmin
