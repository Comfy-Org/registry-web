import type { CustomFlowbiteTheme } from 'flowbite-react'
import { Flowbite } from 'flowbite-react'

const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      primary: 'bg-primary-regular hover:bg-primary-dark text-white',
    },
  },
}

export default function FlowBiteThemeProvider({ children }) {
  return <Flowbite theme={{ theme: customTheme }}>{children}</Flowbite>
}
