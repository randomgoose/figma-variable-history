import { useContext } from 'react';
import { AppContext } from '../AppContext';
import { translations } from '../translation';

export const useTranslation = () => {
  const { setting } = useContext(AppContext);
  const language = setting?.language || 'en-US';

  return {
    t: (key: string) => translations?.[key]?.[language] || key,
  };
};
