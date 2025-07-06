import { useNextTranslation } from '@/src/hooks/i18n'
import React from 'react'

const FilterRegistry: React.FC = () => {
  const { t } = useNextTranslation()

  return (
    <div className="items-center justify-between block my-8 lg:flex">
      <div className="flex text-white">
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
            d="M8 20V10m0 10-3-3m3 3 3-3m5-13v10m0-10 3 3m-3-3-3 3"
          />
        </svg>
        {t('Sort by popularity')}
      </div>
      <div className="relative w-full lg:w-1/3 xs:mt-3">
        <input
          type="search"
          id="search-dropdown"
          className="block p-2.5 w-full z-20 text-sm  rounded-e-lg  focus:ring-gray-700  bg-gray-700   border-gray-600 placeholder-gray-400 text-gray-400 focus:border-gray-500"
          placeholder={t('Search by nodes or publisher')}
          required
        />
        <button
          type="submit"
          className="absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white  rounded-e-lg border border-blue-700  focus:ring-4 focus:outline-none  bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
          <span className="sr-only">{t('Search')}</span>
        </button>
      </div>
    </div>
  )
}

export default FilterRegistry
