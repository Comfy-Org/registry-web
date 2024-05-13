import { Button, Card, TextInput } from 'flowbite-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

const SignIn = () => {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        })
    }

    const handleSignIn = async (e) => {
        e.preventDefault()

        // Perform sign-in logic here with formData

        // Redirect to /publisher route after sign-in
        router.push('/publisher')
    }

    return (
        <section>
            <div className="flex items-center justify-center max-w-screen-xl px-4 py-16 mx-auto lg:grid lg:grid-cols-12 lg:gap-20 h-[100vh]">
                <div className="w-full col-span-12 mx-auto shadow bg-white-900 sm:max-w-lg md:mt-0 xl:p-0">
                    <Card className="max-w-md p-2 bg-gray-800 border border-gray-700 md:p-8 rounded-2xl">
                        <div
                            className="flex justify-center"
                            onClick={() => router.push('/')}
                        >
                            <img
                                src="https://flowbite.com/docs/images/logo.svg"
                                className="h-10 cursor-pointer sm:h-16"
                                alt="Flowbite Logo"
                            />
                        </div>

                        <h1 className="flex justify-center mt-10 text-3xl font-bold text-white ">
                            Log in to Comfy
                        </h1>

                        <div className="mt-10 space-y-3 sm:space-x-4 sm:space-y-0">
                            <Button
                                color="gray"
                                href="#"
                                className="font-bold "
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    viewBox="0 0 21 20"
                                    fill="#ffff"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g clipPath="url(#clip0_13183_10121)">
                                        <path
                                            d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z"
                                            fill="#3F83F8"
                                        />
                                        <path
                                            d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z"
                                            fill="#FBBC04"
                                        />
                                        <path
                                            d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z"
                                            fill="#EA4335"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_13183_10121">
                                            <rect
                                                width="20"
                                                height="20"
                                                fill="white"
                                                transform="translate(0.5)"
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span className="text-gray-900">
                                    Continue with Google
                                </span>
                            </Button>
                        </div>
                        <Button
                            color="gray"
                            href="#"
                            className="mt-2 font-bold hover:bg-gray-50"
                        >
                            <svg
                                className="w-6 h-6 text-gray-800 dark:text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            <span className="text-gray-900">
                                Continue with GitHub
                            </span>
                        </Button>
                        <p className="flex justify-center mt-4 text-sm font-medium text-gray-50 ">
                            New to Comfy Registry?&nbsp;
                            <Link
                                href="/auth/signup"
                                className="font-medium text-blue-600 text-primary-500 hover:underline "
                            >
                                Sign up
                            </Link>
                        </p>
                    </Card>
                </div>
            </div>
        </section>
    )
}

export default SignIn
