const axios = require('axios');

async function getActivatedDiscounts(
  storeMyShopify,
  apiVersion,
  storeAPIkey,
  storePassword,
) {
  const urlLastOrders = `https://${storeAPIkey}:${storePassword}@${storeMyShopify}/admin/api/${apiVersion}/orders.json?status=any`;

  return axios
    .get(urlLastOrders, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response)
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log('@@@@@@@@@@ERROR at getActivatedDiscounts:   ', error);
      return false;
    });
}

exports.getActivatedDiscounts = getActivatedDiscounts;
module.exports = exports;
