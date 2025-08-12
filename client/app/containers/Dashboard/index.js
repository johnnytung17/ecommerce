/**
 *
 * Dashboard
 *
 */

import React from 'react';

import { connect } from 'react-redux';

import actions from '../../actions';
import { ROLES } from '../../constants';
import { withTranslation } from '../../utils/translation';
import { isDisabledMerchantAccount } from '../../utils/app';
import Admin from '../../components/Manager/Dashboard/Admin';
import Merchant from '../../components/Manager/Dashboard/Merchant';
import Customer from '../../components/Manager/Dashboard/Customer';
import DisabledMerchantAccount from '../../components/Manager/DisabledAccount/Merchant';
import LoadingIndicator from '../../components/Common/LoadingIndicator';

class Dashboard extends React.PureComponent {
  componentDidMount() {
    this.props.fetchProfile();
  }

  getDashboardLinks = (role, t) => {
    const baseLinks = [
      { to: "", name: t('accountDetails'), prefix: "/dashboard" },
      {
        to: "/security",
        name: t('accountSecurity'),
        prefix: "/dashboard",
        provider: ["Email"]
      },
      { to: "/address", name: t('address'), prefix: "/dashboard" }
    ];

    const roleSpecificLinks = {
      [ROLES.Admin]: [
        ...baseLinks,
        { to: "/product", name: t('products'), prefix: "/dashboard" },
        { to: "/category", name: t('categories'), prefix: "/dashboard" },
        { to: "/brand", name: t('brand'), prefix: "/dashboard" },
        { to: "/users", name: t('users'), prefix: "/dashboard" },
        { to: "/merchant", name: t('merchants'), prefix: "/dashboard" },
        { to: "/orders", name: t('orders'), prefix: "/dashboard" },
        { to: "/review", name: t('reviews'), prefix: "/dashboard" },
        { to: "/wishlist", name: t('wishlist'), prefix: "/dashboard" },
        { to: "/support", name: t('support') }
      ],
      [ROLES.Merchant]: [
        ...baseLinks,
        { to: "/brand", name: t('brand'), prefix: "/dashboard" },
        { to: "/product", name: t('products'), prefix: "/dashboard" },
        { to: "/orders", name: t('orders'), prefix: "/dashboard" },
        { to: "/wishlist", name: t('wishlist'), prefix: "/dashboard" },
        { to: "/support", name: t('support') }
      ],
      [ROLES.Member]: [
        ...baseLinks,
        { to: "/orders", name: t('orders'), prefix: "/dashboard" },
        { to: "/wishlist", name: t('wishlist'), prefix: "/dashboard" },
        { to: "/support", name: t('support') }
      ]
    };

    return roleSpecificLinks[role] || roleSpecificLinks[ROLES.Member];
  };

  render() {
    const { user, isLoading, isMenuOpen, toggleDashboardMenu, t } = this.props;

    if (isDisabledMerchantAccount(user))
      return <DisabledMerchantAccount user={user} />;

    return (
      <>
        {isLoading ? (
          <LoadingIndicator inline />
        ) : user.role === ROLES.Admin ? (
          <Admin
            user={user}
            isMenuOpen={isMenuOpen}
            links={this.getDashboardLinks(ROLES.Admin, t)}
            toggleMenu={toggleDashboardMenu}
          />
        ) : user.role === ROLES.Merchant && user.merchant ? (
          <Merchant
            user={user}
            isMenuOpen={isMenuOpen}
            links={this.getDashboardLinks(ROLES.Merchant, t)}
            toggleMenu={toggleDashboardMenu}
          />
        ) : (
          <Customer
            user={user}
            isMenuOpen={isMenuOpen}
            links={this.getDashboardLinks(ROLES.Member, t)}
            toggleMenu={toggleDashboardMenu}
          />
        )}
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.account.user,
    isLoading: state.account.isLoading,
    isMenuOpen: state.dashboard.isMenuOpen
  };
};

export default connect(mapStateToProps, actions)(withTranslation(Dashboard));
