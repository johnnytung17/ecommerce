import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getTranslation, defaultLanguage } from '../../locales';

// Language Context
const LanguageContext = createContext();

// Language actions
const SET_LANGUAGE = 'SET_LANGUAGE';

// Language reducer
const languageReducer = (state, action) => {
  switch (action.type) {
    case SET_LANGUAGE:
      return {
        ...state,
        currentLanguage: action.payload,
        translations: getTranslation(action.payload)
      };
    default:
      return state;
  }
};

// Language Provider
export const LanguageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(languageReducer, {
    currentLanguage: defaultLanguage,
    translations: getTranslation(defaultLanguage)
  });

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage && savedLanguage !== state.currentLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (language) => {
    localStorage.setItem('preferred_language', language);
    dispatch({
      type: SET_LANGUAGE,
      payload: language
    });
  };

  return (
    <LanguageContext.Provider value={{ ...state, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation helper function
export const useTranslation = () => {
  const { translations } = useLanguage();
  
  const t = (key, defaultValue = key) => {
    return translations[key] || defaultValue;
  };
  
  return { t };
};
