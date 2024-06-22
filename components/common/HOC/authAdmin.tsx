import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useGetUser } from 'src/api/generated'

const withAdmin = (WrappedComponent) => {
    const HOC = (props: JSX.IntrinsicAttributes) => {
        const router = useRouter()
        const { data: user, isLoading } = useGetUser()

        useEffect(() => {
            if (!isLoading && !user?.isAdmin) {
                console.log('redirecting')
                router.push('/')
            }
        }, [user, router, isLoading])

        return <WrappedComponent {...props} />
    }

    if (WrappedComponent.getInitialProps) {
        HOC.getInitialProps = WrappedComponent.getInitialProps
    }

    return HOC
}

export default withAdmin
