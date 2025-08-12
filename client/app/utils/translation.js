import React from 'react';
import { useLanguage, useTranslation } from '../contexts/Language';

// HOC to provide translation functionality to class components
export const withTranslation = (WrappedComponent) => {
  return React.forwardRef((props, ref) => {
    const languageContext = useLanguage();
    const { t } = useTranslation();
    
    return (
      <WrappedComponent 
        {...props} 
        ref={ref}
        currentLanguage={languageContext.currentLanguage}
        translations={languageContext.translations}
        setLanguage={languageContext.setLanguage}
        t={t}
      />
    );
  });
};

// Hook for functional components
export { useTranslation, useLanguage };

// Translation helper for getting nested translations
export const getNestedTranslation = (translations, keyPath, defaultValue = '') => {
  return keyPath.split('.').reduce((obj, key) => obj && obj[key], translations) || defaultValue;
};
