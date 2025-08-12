/*
 *
 * Newsletter
 *
 */

import React from 'react';

import { connect } from 'react-redux';

import actions from '../../actions';
import { withTranslation } from '../../utils/translation';

import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';

class Newsletter extends React.PureComponent {
  render() {
    const { email, newsletterChange, subscribeToNewsletter, formErrors, t } =
      this.props;

    const handleSubmit = event => {
      event.preventDefault();
      subscribeToNewsletter();
    };

    const SubscribeButton = (
      <Button type='submit' variant='primary' text={t('subscribe')} />
    );

    return (
      <div className='newsletter-form'>
        <p>{t('signUpNewsletter')}</p>
        <form onSubmit={handleSubmit}>
          <div className='subscribe'>
            <Input
              type={'text'}
              error={formErrors['email']}
              name={'email'}
              placeholder={t('enterYourEmail')}
              value={email}
              onInputChange={(name, value) => {
                newsletterChange(name, value);
              }}
              inlineElement={SubscribeButton}
            />
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    email: state.newsletter.email,
    formErrors: state.newsletter.formErrors
  };
};

export default connect(mapStateToProps, actions)(withTranslation(Newsletter));
