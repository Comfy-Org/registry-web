import { Button } from 'flowbite-react'
import React from 'react'

interface LogoutStoryProps {
    isLoading?: boolean
    error?: string
    onLogout?: () => void
    showSuccessMessage?: boolean
}

/**
 * A simplified version of the Logout component for Storybook
 * This avoids Firebase dependencies
 */
const LogoutStory: React.FC<LogoutStoryProps> = ({
    isLoading = false,
    error,
    onLogout = () => console.log('Logout clicked'),
    showSuccessMessage = false,
}) => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <section className="p-4">
                <div className="text-center">
                    {showSuccessMessage && (
                        <div className="mb-4 p-3 bg-green-600 text-white rounded">
                            Successfully logged out!
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-600 text-white rounded">
                            Logout Error: {error}
                        </div>
                    )}

                    <Button
                        onClick={onLogout}
                        disabled={isLoading}
                        color={isLoading ? 'gray' : 'blue'}
                    >
                        {isLoading ? 'Logging out...' : 'Logout'}
                    </Button>

                    {isLoading && (
                        <p className="mt-2 text-gray-400">Logging out...</p>
                    )}
                </div>
            </section>
        </div>
    )
}

export default LogoutStory