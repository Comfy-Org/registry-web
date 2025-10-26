import { Button } from 'flowbite-react'
import { useNextTranslation } from '@/src/hooks/i18n'

const DrHeader = () => {
  const { t } = useNextTranslation()
  return (
    <section className="block lg:items-center lg:flex lg:justify-start ">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
        {t('Publishers')}
      </h1>

      <Button color="blue" className="w-full p-0 lg:w-24 lg:ml-10 xs:mt-3">
        <svg
          className="w-6 h-6 text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <span className="ml-2">{t('Add')}</span>
      </Button>
    </section>
  )
}

export default DrHeader
