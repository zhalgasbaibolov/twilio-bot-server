/* eslint-disable no-console */
const axios = require('axios');

const storeMyShopify = '';
const apiVersion = '2021-07';
const storeAPIkey = '';
const storePassword = '';
const discountPercent = '-5.0';

// this initialize func to be called just once for each store when they first buy saletastic
function shopifyStoreDiscountsInitialize() {
  const dataPriceRule = {
    price_rule: {
      title: 'cart-abd-discount-new',
      target_type: 'line_item',
      target_selection: 'all',
      allocation_method: 'across',
      value_type: 'percentage',
      value: discountPercent,
      customer_selection: 'all',
      once_per_customer: true,
      starts_at: '2021-08-23',
      usage_limit: '1',
    },
  };
  const sessionUrlPriceRule = `https://${storeMyShopify}/admin/api/${apiVersion}/price_rules.json`;

  return axios
    .post(sessionUrlPriceRule, JSON.stringify(dataPriceRule), {
      auth: {
        username: storeAPIkey,
        password: storePassword,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      console.log(`response is (price rule create): ${response.map((x) => x.id)
      }`);
      return response;
    })
    .catch((error) => {
      console.log('@@@@@@@@@@ERROR', error);
      return false;
    });
}

shopifyStoreDiscountsInitialize();
