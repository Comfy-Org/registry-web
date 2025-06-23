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
        this.isProduction = process.env.NEXT_PUBLIC_ENV === 'production'

        if (this.isProduction && process.env.NEXT_PUBLIC_MIXPANEL_KEY) {
            mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_KEY, {
                debug: true,
                track_pageview: true,
                persistence: 'localStorage',
                api_host: 'https://mp.comfy.org',
            })
        }
    }

    public track(event: string, properties?: object): void {
        if (this.isProduction) {
            mixpanel.track(event, properties)
        }
    }

    public identify(distinctId: string): void {
        if (this.isProduction) {
            mixpanel.identify(distinctId)
        }
    }

    public setProfile(updates: UserProfile): void {
        if (this.isProduction) {
            mixpanel.people.set(updates)
        }
    }
}

const analytic = new MixpanelAnalytics()
export default analytic
