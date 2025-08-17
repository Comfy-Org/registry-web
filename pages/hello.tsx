import { NextPage } from 'next'

const HelloPage: NextPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Hello World!
                </h1>
                <p className="text-lg text-gray-600">
                    Welcome to the ComfyUI Registry
                </p>
            </div>
        </div>
    )
}

export default HelloPage
