import { CustomFlowbiteTheme } from 'flowbite-react'

// Theme configuration for both light and dark modes
export const themeConfig = {
  modal: {
    overlay: 'bg-gray-900/50 dark:bg-gray-900/80',
    content: 'bg-white dark:bg-gray-800',
    inner: 'bg-white dark:bg-gray-200',
    body: 'bg-white dark:bg-gray-100',
    header: {
      border: 'border-gray-200 dark:border-gray-600',
      title: 'text-black dark:text-white',
    },
    close: {
      base: 'text-black hover:bg-gray-100 hover:text-black dark:hover:bg-gray-600 dark:hover:text-white',
    },
    footer: {
      border: 'border-gray-200 dark:border-gray-600',
    },
  },
  textInput: {
    base: 'border-gray-300 bg-white text-black dark:border-gray-500 dark:bg-gray-600 dark:text-gray-200 focus:border-blue-500 focus:ring-blue-500',
    addon:
      'border-gray-300 bg-white text-black dark:border-gray-500 dark:bg-gray-600 dark:text-gray-200',
    icon: 'text-black dark:text-gray-400',
  },
  textArea: {
    base: 'border-gray-300 bg-white text-black placeholder-black dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
  },
  pagination: {
    text: 'text-black dark:text-gray-400',
    span: 'text-black dark:text-white',
    button:
      'border-gray-300 bg-white text-black hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
    active:
      'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white',
  },
  header: {
    background: 'bg-white dark:bg-gray-900',
    text: 'text-black dark:text-white',
    border: 'border-gray-200 dark:border-gray-700',
  },
  navbar: {
    background: 'bg-white dark:bg-gray-900',
    item: 'text-black hover:text-gray-700 dark:text-gray-300 dark:hover:text-white',
  },
  dropdown: {
    background: 'bg-white dark:bg-gray-800',
    item: 'text-black hover:bg-gray-200 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
    border: 'border-gray-200 dark:border-gray-600',
  },
  body: {
    background: 'bg-white dark:bg-gray-900',
    text: 'text-black dark:text-white',
  },
  card: {
    background: 'bg-white dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    text: 'text-black dark:text-white',
  },
  button: {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary:
      'bg-white hover:bg-gray-700 text-black hover:text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    ghost:
      'text-black hover:text-white hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700',
    login:
      'bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white',
    documentation:
      'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600',
    signup:
      'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600',
  },
  // Additional component backgrounds
  content: {
    primary: 'bg-white dark:bg-gray-800',
    secondary: 'bg-white dark:bg-gray-700',
    tertiary: 'bg-white dark:bg-gray-600',
  },
  table: {
    header: 'bg-white dark:bg-gray-800',
    cell: 'bg-white dark:bg-gray-800',
    stripe: 'bg-white dark:bg-gray-900',
  },
  form: {
    background: 'bg-white dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
  },
  navigation: {
    background: 'bg-white dark:bg-gray-800',
    text: 'text-black dark:text-white',
  },
  admin: {
    panel: 'bg-white dark:bg-gray-800',
    sticky: 'bg-white dark:bg-gray-800',
  },
  nodeDetails: {
    background: 'bg-gray-100 dark:bg-gray-900',
    text: 'text-black dark:text-white',
    card: 'bg-gray-200 dark:bg-gray-700',
    cardBorder: 'border-gray-300 dark:border-gray-500',
    cardText: 'text-black dark:text-gray-200',
    metaText: 'text-gray-600 dark:text-gray-400',
  },
  breadcrumb: {
    item: 'text-black hover:text-gray-700 dark:text-gray-300 dark:hover:text-white',
    link: '!text-black hover:!text-gray-700 dark:!text-gray-300 dark:hover:!text-white no-underline',
    separator: 'text-gray-500 dark:text-gray-400',
  },
}

// Helper function to get theme classes dynamically
export const getThemeClasses = (path: string) => {
  const keys = path.split('.')
  let current: any = themeConfig

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return ''
    }
  }

  return typeof current === 'string' ? current : ''
}

export const customThemeTModal: CustomFlowbiteTheme = {
  root: {
    base: 'fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full rounded-lg',
    show: {
      on: `flex ${themeConfig.modal.overlay}`,
      off: 'hidden',
    },
    sizes: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
    },
    positions: {
      'top-left': 'items-start justify-start',
      'top-center': 'items-start justify-center',
      'top-right': 'items-start justify-end',
      'center-left': 'items-center justify-start',
      center: 'items-center justify-center',
      'center-right': 'items-center justify-end',
      'bottom-right': 'items-end justify-end',
      'bottom-center': 'items-end justify-center',
      'bottom-left': 'items-end justify-start',
    },
  },
  content: {
    base: `relative h-full w-full p-4 md:h-auto rounded-2xl ${themeConfig.modal.content}`,
    inner: `relative flex max-h-[90dvh] flex-col rounded-lg ${themeConfig.modal.inner}`,
  },
  body: {
    base: `flex-1 overflow-auto p-6 ${themeConfig.modal.body}`,
    popup: 'pt-0',
  },
  header: {
    base: `flex items-start justify-between rounded-t border-b p-5 ${themeConfig.modal.header.border}`,
    popup: 'border-b-0 p-2',
    title: `text-xl font-medium ${themeConfig.modal.header.title}`,
    close: {
      base: `ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm ${themeConfig.modal.close.base}`,
      icon: 'h-5 w-5',
    },
  },
  footer: {
    //@ts-ignore
    base: `flex items-center space-x-2 rounded-b p-6 ${themeConfig.modal.footer.border}`,
    popup: 'border-t',
  },
}

export const customThemeTextInput = {
  base: 'flex',
  addon: `inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm ${themeConfig.textInput.addon}`,
  field: {
    base: 'relative w-full',
    icon: {
      base: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
      svg: `h-5 w-5 ${themeConfig.textInput.icon}`,
    },
    rightIcon: {
      base: 'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3',
      svg: `h-5 w-5 ${themeConfig.textInput.icon}`,
    },
    input: {
      base: 'block w-full border disabled:cursor-not-allowed disabled:opacity-50',
      sizes: {
        sm: 'p-2 sm:text-xs',
        md: 'p-2.5 text-sm',
        lg: 'p-4 sm:text-base',
      },
      colors: {
        gray: themeConfig.textInput.base,
        info: 'border-blue-500 bg-white text-black focus:border-blue-500 focus:ring-blue-500 dark:border-blue-400 dark:bg-blue-100',
        failure:
          'border-red-500 bg-white text-black focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:bg-red-100',
        warning:
          'border-yellow-500 bg-white text-black focus:border-yellow-500 focus:ring-yellow-500 dark:border-yellow-400 dark:bg-yellow-100',
        success:
          'border-green-500 bg-white text-black focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:bg-green-100',
      },
    },
  },
}

export const CustomThemeTextArea = {
  base: 'block w-full rounded-lg border text-sm disabled:cursor-not-allowed disabled:opacity-50',
  colors: {
    gray: themeConfig.textArea.base,
    info: 'border-blue-500 bg-white text-black placeholder-black focus:border-blue-500 focus:ring-blue-500 dark:border-blue-400 dark:bg-blue-100 dark:placeholder-blue-600',
    failure:
      'border-red-500 bg-white text-black placeholder-black focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:bg-red-100 dark:placeholder-red-600',
    warning:
      'border-yellow-500 bg-white text-black placeholder-black focus:border-yellow-500 focus:ring-yellow-500 dark:border-yellow-400 dark:bg-yellow-100 dark:placeholder-yellow-600',
    success:
      'border-green-500 bg-white text-black placeholder-black focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:bg-green-100 dark:placeholder-green-600',
  },
  withShadow: {
    on: 'shadow-sm',
    off: '',
  },
}

export const CustomThemePagination: CustomFlowbiteTheme = {
  //@ts-ignore
  base: '',
  layout: {
    table: {
      base: themeConfig.pagination.text,
      span: `font-semibold ${themeConfig.pagination.span}`,
    },
  },
  pages: {
    base: 'xs:mt-0 mt-2 inline-flex items-center -space-x-px',
    showIcon: 'inline-flex',
    previous: {
      base: `ml-0 rounded-l-lg border px-3 py-2 leading-tight enabled:hover:bg-gray-100 enabled:hover:text-black ${themeConfig.pagination.button}`,
      icon: 'h-5 w-5',
    },
    next: {
      base: `rounded-r-lg border px-3 py-2 leading-tight enabled:hover:bg-gray-100 enabled:hover:text-black ${themeConfig.pagination.button}`,
      icon: 'h-5 w-5',
    },
    selector: {
      base: `w-12 border py-2 leading-tight enabled:hover:bg-gray-100 enabled:hover:text-black ${themeConfig.pagination.button}`,
      active: themeConfig.pagination.active,
      disabled: 'cursor-not-allowed opacity-50',
    },
  },
}

export const CustomThemeBreadcrumb = {
  root: {
    base: '',
    list: 'flex items-center',
  },
  item: {
    base: '',
    chevron: `mx-1 h-4 w-4 ${themeConfig.breadcrumb.separator}`,
    href: {
      off: `ml-1 text-sm font-medium ${themeConfig.breadcrumb.item} md:ml-2`,
      on: `ml-1 text-sm font-medium ${themeConfig.breadcrumb.link} md:ml-2`,
    },
    icon: 'mr-2 h-4 w-4',
  },
}
