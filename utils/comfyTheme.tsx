import { CustomFlowbiteTheme } from 'flowbite-react'
import { themeConfig } from './themeConfig'

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
        info: 'border-blue-500 bg-blue-50 text-blue-900 focus:border-blue-500 focus:ring-blue-500',
        failure:
          'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500',
        warning:
          'border-yellow-500 bg-yellow-50 text-yellow-900 focus:border-yellow-500 focus:ring-yellow-500',
        success:
          'border-green-500 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500',
      },
    },
  },
}

export const CustomThemeTextArea = {
  base: 'block w-full rounded-lg border text-sm disabled:cursor-not-allowed disabled:opacity-50',
  colors: {
    gray: themeConfig.textArea.base,
    info: 'border-blue-500 bg-blue-50 text-blue-900 placeholder-blue-700 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-400 dark:bg-blue-100 dark:placeholder-blue-600',
    failure:
      'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:bg-red-100 dark:placeholder-red-600',
    warning:
      'border-yellow-500 bg-yellow-50 text-yellow-900 placeholder-yellow-700 focus:border-yellow-500 focus:ring-yellow-500 dark:border-yellow-400 dark:bg-yellow-100 dark:placeholder-yellow-600',
    success:
      'border-green-500 bg-green-50 text-green-900 placeholder-green-700 focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:bg-green-100 dark:placeholder-green-600',
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
      base: `ml-0 rounded-l-lg border px-3 py-2 leading-tight enabled:hover:bg-gray-100 enabled:hover:text-gray-700 ${themeConfig.pagination.button}`,
      icon: 'h-5 w-5',
    },
    next: {
      base: `rounded-r-lg border px-3 py-2 leading-tight enabled:hover:bg-gray-100 enabled:hover:text-gray-700 ${themeConfig.pagination.button}`,
      icon: 'h-5 w-5',
    },
    selector: {
      base: `w-12 border py-2 leading-tight enabled:hover:bg-gray-100 enabled:hover:text-gray-700 ${themeConfig.pagination.button}`,
      active: themeConfig.pagination.active,
      disabled: 'cursor-not-allowed opacity-50',
    },
  },
}
