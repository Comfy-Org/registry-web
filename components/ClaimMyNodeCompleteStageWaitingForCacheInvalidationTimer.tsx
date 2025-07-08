/**
 * CacheWaitingTimer Component
 * Displays a countdown timer for cache refresh after node ownership changes
 *
 * @deprecated This component will be delete when the cache invalidation is handled correctly by the backend
 */
import { useEffect, useState } from 'react'
import { useNextTranslation } from '@/src/hooks/i18n'

interface ClaimMyNodeCompleteStageWaitingForCacheInvalidationTimerProps {
    completedAt: Date
    cacheRefreshDurationMinutes?: number
}

export default function ClaimMyNodeCompleteStageWaitingForCacheInvalidationTimer({
    completedAt,
    cacheRefreshDurationMinutes = 30,
}: ClaimMyNodeCompleteStageWaitingForCacheInvalidationTimerProps) {
    const { t } = useNextTranslation()
    const [timeRemaining, setTimeRemaining] = useState<number>(0)

    // Calculate initial time remaining based on completedAt
    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date()
            const elapsedMs = now.getTime() - completedAt.getTime()
            const elapsedSeconds = Math.floor(elapsedMs / 1000)
            const totalCacheSeconds = cacheRefreshDurationMinutes * 60
            const remaining = Math.max(0, totalCacheSeconds - elapsedSeconds)
            setTimeRemaining(remaining)
        }

        calculateTimeRemaining()
    }, [completedAt, cacheRefreshDurationMinutes])

    // Timer effect for countdown
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [timeRemaining])

    // Format time remaining for display
    const formatTimeRemaining = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    return (
        <div className="bg-gray-600 p-4 rounded-lg mb-6 text-center">
            <div className="mb-3">
                <div className="text-3xl font-mono font-bold text-blue-400 mb-2">
                    {formatTimeRemaining(timeRemaining)}
                </div>
                <p className="text-gray-300 text-sm">
                    {timeRemaining > 0
                        ? t('Cache refresh time remaining')
                        : t('Cache refresh completed')}
                </p>
            </div>
            <p className="text-gray-300 text-sm max-w-[35em]">
                {timeRemaining > 0
                    ? t(
                          'The node ownership change may take up to 30 minutes to reflect across all pages due to caching. Please check the node page later.'
                      )
                    : t(
                          'The cache has been refreshed. The node ownership change should now be visible to the public.'
                      )}
            </p>
        </div>
    )
}
