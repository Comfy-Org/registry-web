import { useNextTranslation } from '@/src/hooks/i18n'
import { LANGUAGE_NAMES } from '@/src/constants'
import { Dropdown } from 'flowbite-react'
import React from 'react'

interface LanguageSwitcherProps {
  className?: string
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const { t, changeLanguage, currentLanguage } = useNextTranslation()
  return (
    <Dropdown
      label={LANGUAGE_NAMES[currentLanguage] || 'Language'}
      color="gray"
      className={className}
    >
      {Object.entries(LANGUAGE_NAMES).map(([langCode, langName]) => (
        <Dropdown.Item
          key={langCode}
          onClick={() => changeLanguage(langCode)}
          className={currentLanguage === langCode ? 'font-bold' : ''}
        >
          {langName}
        </Dropdown.Item>
      ))}
    </Dropdown>
  )
}

export default LanguageSwitcher
