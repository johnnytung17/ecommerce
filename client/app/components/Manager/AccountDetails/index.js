/**
 *
 * AccountDetails
 *
 */

import React from 'react';

import { Row, Col } from 'reactstrap';

import { EMAIL_PROVIDER } from '../../../constants';
import { withTranslation } from '../../../utils/translation';
import UserRole from '../UserRole';
import Input from '../../Common/Input';
import Button from '../../Common/Button';

const AccountDetails = props => {
  const { user, accountChange, updateProfile, t } = props;

  const handleSubmit = event => {
    event.preventDefault();
    updateProfile();
  };

  return (
    <div className='account-details'>
      <div className='info'>
        <div className='desc'>
          <p className='one-line-ellipsis mr-3'>
            {user.provider === EMAIL_PROVIDER.Email ? (
              user.email
            ) : (
              <span className='provider-email'>
                {t('loggedInWith')} {user.provider}
              </span>
            )}
          </p>
          <UserRole user={user} />
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Row>
          <Col xs='12' md='6'>
            <Input
              type={'text'}
              label={t('firstName')}
              name={'firstName'}
              placeholder={t('enterFirstName')}
              value={user.firstName ? user.firstName : ''}
              onInputChange={(name, value) => {
                accountChange(name, value);
              }}
            />
          </Col>
          <Col xs='12' md='6'>
            <Input
              type={'text'}
              label={t('lastName')}
              name={'lastName'}
              placeholder={t('enterLastName')}
              value={user.lastName ? user.lastName : ''}
              onInputChange={(name, value) => {
                accountChange(name, value);
              }}
            />
          </Col>
          <Col xs='12' md='12'>
            <Input
              type={'text'}
              label={t('phoneNumber')}
              name={'phoneNumber'}
              placeholder={t('enterPhoneNumber')}
              value={user.phoneNumber ? user.phoneNumber : ''}
              onInputChange={(name, value) => {
                accountChange(name, value);
              }}
            />
          </Col>
        </Row>
        <hr />
        <div className='profile-actions'>
          <Button type='submit' variant='secondary' text={t('saveChanges')} />
        </div>
      </form>
    </div>
  );
};

export default withTranslation(AccountDetails);
