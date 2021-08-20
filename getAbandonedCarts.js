const axios = require('axios');

async function getAbandonedCarts(
  storeMyShopify,
  apiVersion,
  storeAPIkey,
  storePassword,
) {
  const urlLastCheckouts = `https://${storeAPIkey}:${storePassword}@${storeMyShopify}/admin/api/${apiVersion}/checkouts.json`;

  return axios
    .get(urlLastCheckouts, {
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

module.exports = getAbandonedCarts;
