import mixpanel from 'mixpanel-browser'

interface UserProfile {
    $email: string | null
    $first_name?: string
    $last_name?: string
    $phone?: string
    [key: string]: any
}

class MixpanelAnalytics {
    private isProduction: boolean

    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production'

        if (this.isProduction && process.env.NEXT_PUBLIC_MIXPANEL_KEY) {
            mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_KEY, {
                debug: true,
                track_pageview: true,
                persistence: 'localStorage',
            })
        }
    }

    // Track an event with optional properties
    public track(event: string, properties?: object): void {
        if (this.isProduction) {
            analytic.track(event, properties)
        } else {
            console.log(
                `Mixpanel Track - Event: ${event}, Properties: ${JSON.stringify(properties)}`
            )
        }
    }

    // Identify a user with a distinct ID
    public identify(distinctId: string): void {
        if (this.isProduction) {
            mixpanel.identify(distinctId)
        } else {
            console.log(`Mixpanel Identify - Distinct ID: ${distinctId}`)
        }
    }

    public setProfile(updates: UserProfile): void {
        if (this.isProduction) {
            mixpanel.people.set(updates)
        } else {
            console.log(
                `Mixpanel Set Profile - Updates: ${JSON.stringify(updates)}`
            )
        }
    }
}

const analytic = new MixpanelAnalytics()
export default analytic