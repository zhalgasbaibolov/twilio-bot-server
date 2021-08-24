const axios = require('axios');

async function getAllCheckouts(
  storeMyShopify,
  apiVersion,
  storeAPIkey,
  storePassword,
  enterDate = new Date(),
) {
  enterDate.setDate(enterDate.getDate() - 1);
  let newDate = enterDate.toISOString();
  newDate = newDate.substring(0, newDate.length - 5);
  const urlCheckouts = `https://${storeAPIkey}:${storePassword}@${storeMyShopify}/admin/api/${apiVersion}/checkouts.json?updated_at_min=${newDate}`;

  return axios
    .get(urlCheckouts,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    .then((response) => response)
    .catch((error) => {
    // eslint-disable-next-line no-console
      console.log('@@@@@@@@@@ERROR at getAllCheckouts:   ', (error && error.config && error.config.url));
      return false;
    });
}

module.exports = getAllCheckouts;
