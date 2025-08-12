import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { useLanguage, useTranslation } from '../../../contexts/Language';
import { supportedLanguages } from '../../../locales';

class LanguageSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  };

  render() {
    const { currentLanguage, setLanguage, translations } = this.props;

    const languageNames = {
      en: translations.english || 'English',
      vi: translations.vietnamese || 'Tiếng Việt'
    };

    const flagIcons = {
      en: '🇺🇸',
      vi: '🇻🇳'
    };

    return (
      <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle 
          caret 
          color="link" 
          className="text-decoration-none d-flex align-items-center language-selector-toggle"
        >
          <span className="mr-2">{flagIcons[currentLanguage]}</span>
          <span className="d-none d-md-inline">
            {languageNames[currentLanguage]}
          </span>
          <span className="d-inline d-md-none">
            {currentLanguage.toUpperCase()}
          </span>
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem header className="text-center">{translations.language}</DropdownItem>
          <DropdownItem divider />
          {supportedLanguages.map(lang => (
            <DropdownItem 
              key={lang}
              active={currentLanguage === lang}
              onClick={() => setLanguage(lang)}
              className="d-flex align-items-center"
            >
              <span className="mr-2">{flagIcons[lang]}</span>
              <span>{languageNames[lang]}</span>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    );
  }
}

// HOC to inject language context
const withLanguage = (Component) => {
  return (props) => {
    const languageContext = useLanguage();
    const { t } = useTranslation();
    
    return (
      <Component 
        {...props} 
        {...languageContext}
        translations={languageContext.translations}
        t={t}
      />
    );
  };
};

export default withLanguage(LanguageSelector);
