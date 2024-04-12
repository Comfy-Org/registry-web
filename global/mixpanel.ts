import mixpanel, { Query, Dict } from 'mixpanel-browser'

const DEV_TOKEN = '870bb2acb59a9bd5852ef3fe3f6d13a8'
const PROD_TOKEN = '75c9618ea1d0be347f660f92de1493b3'

mixpanel.init(
    process.env.NEXT_PUBLIC_FIREBASE_STAGE === 'prod' ? PROD_TOKEN : DEV_TOKEN,
    { track_pageview: true, debug: true, ignore_dnt: true }
)
mixpanel.register({ Platform: 'Web' })

let env_check =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_TEST_MIXPANEL === 'true'

let actions = {
    identify: (id) => {
        if (env_check) mixpanel.identify(id)
    },
    alias: (id) => {
        if (env_check) mixpanel.alias(id)
    },
    track: (name, props?: Dict) => {
        if (env_check) mixpanel.track(name, props)
    },
    track_links: (query: Query, name: string) => {
        if (env_check)
            mixpanel.track_links(query, name, {
                referrer: document.referrer,
            })
    },
    people: {
        set: (props) => {
            if (env_check) mixpanel.people.set(props)
        },
    },
}

export let Mixpanel = actions
