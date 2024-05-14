import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
    // https://next-auth.js.org/configuration/providers
    providers: [
        GithubProvider({
            clientId: process.env.NEXT_GITHUB_ID as string,

            clientSecret: process.env.NEXT_GITHUB_SECRET as string,
        }),
        GoogleProvider({
            clientId: process.env.NEXT_GOOGLE_ID as string,

            clientSecret: process.env.NEXT_GOOGLE_SECRET as string,
        }),
    ],
    pages: {
        signIn: '/auth/signin',
    },
})
