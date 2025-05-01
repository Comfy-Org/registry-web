import { Spinner } from 'flowbite-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useGetUser } from 'src/api/generated'

/** this HOC component should be used in page level, since h-[50vh] in loading spinner settle */
const withAdmin = (WrappedComponent) => {
    const HOC = (props: JSX.IntrinsicAttributes) => {
        const router = useRouter()
        const { data: user, isLoading } = useGetUser()
        useEffect(() => {
            if (!isLoading && !user?.isAdmin) {
                router.push('/')
            }
        }, [user, router, isLoading])

        if (isLoading)
            return (
                <div className="flex-grow flex justify-center items-center h-[50vh]">
                    <Spinner />
                </div>
            )

        if (user?.isAdmin) {
            return <WrappedComponent {...props} />
        }

        // Show 403 when user === undefined and user.isAdmin === false
        return (
            <div className="text-white dark:text-white">
                403 Forbidden: You have no permission to this page. Redirecting
                to home page.
            </div>
        )
    }

    if (WrappedComponent.getInitialProps) {
        HOC.getInitialProps = WrappedComponent.getInitialProps
    }

    return HOC
}

export default withAdmin
