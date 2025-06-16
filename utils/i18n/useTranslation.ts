import { useTranslation as useNextTranslation } from 'next-i18next';

export const useTranslation = (namespace = 'common') => {
  return useNextTranslation(namespace);
};
