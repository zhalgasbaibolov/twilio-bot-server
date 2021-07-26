const shopify = {
  banarasi: {
    storeAPIkey: 'a55e9f8e5d6feebd23752396acd80cc4',
    storePassword: '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',
    accessToken: '9d75b9d30a16f02bb9517f2aafd9bd48',
    storeMyShopify: 'banarasi-outfit.myshopify.com',
    externalUrl: 'banarasioutfit.in',
    apiVersion: '2021-04',
    priceRuleId: '942249935042',
  },
  fatCatStudio: {
    storeAPIkey: '0f6b58da9331414de7ed1d948c67ac35',
    storePassword: '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',
    accessToken: '0386d977a264448a1b62c295ac542a0d',
    storeMyShopify: 'fat-cat-studio.myshopify.com',
    apiVersion: '2021-04',
    externalUrl: 'banarasioutfit.in',
    priceRuleId: '950294741183',
  },
};

const twilio = {
  avalanche2: {
    joinWord: 'join where-water',
    accountSid: 'ACd40192a9c430fabab5e2e934c0f98fe4',
    authToken: 'f76a5a44bbea4533fb7a17d0c9ff9954',
  },
  saletastic: {
    joinWord: 'join young-skin',
    accountSid: 'AC534b07c807465b936b2241514b536512',
    authToken: 'bb8a07f3c43fe27e44a5f521c80a8a2f',
  },
};

const conf = { shopify: shopify.banarasi, twilio: twilio.saletastic };

if (process.env.shopify) {
  Object.assign(conf, shopify[process.env.shopify]);
}

if (process.env.twilio) {
  Object.assign(conf, twilio[process.env.twilio]);
}

module.exports = conf;
