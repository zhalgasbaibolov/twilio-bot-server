/* eslint-disable no-console */
const {
  gql,
  GraphQLClient,
} = require('graphql-request');
const axios = require('axios');

module.exports.ShopifyApi = function ShopifyApi(settings) {
  const {
    storeMyShopify, accessToken, apiVersion, priceRuleId, storeAPIkey, storePassword,
  } = settings;
  // console.log(settings);
  const retireveCollections = async () => {
    const endpoint = `https://${storeAPIkey}:${storePassword}@${storeMyShopify}/admin/api/${apiVersion}/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint);

    const query = gql`
      {
        collections(first: 250) {
          edges {
            node {
              id
              handle
              title
              description
            }
          }
        }
      }
    `;
    return graphQLClient.request(query);
  };

  const shopifyStoreDiscountsInitialize = async (discountPercent) => {
    const dataPriceRule = {
      price_rule: {
        title: 'saletastic-cart-abd-discount',
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        value_type: 'percentage',
        value: discountPercent,
        customer_selection: 'all',
        once_per_customer: true,
        starts_at: '2021-07-09',
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
        console.log('response is (price rule create):   ', response);
        return response;
      })
      .catch((error) => {
        console.log('@@@@@@@@@@ERROR AT PRICE RULE CREATE:   ', error);
        return false;
      });
  };

  const shopifyDiscountCreate = async (
    randomString,
  ) => {
    const ruleId = priceRuleId || await shopifyStoreDiscountsInitialize();

    const dataDiscount = {
      discount_code: {
        code: randomString,
      },
    };

    const sessionUrlDiscount = `https://${storeMyShopify}/admin/api/${apiVersion}/price_rules/${ruleId}/discount_codes.json`;
    console.log(sessionUrlDiscount);
    return axios
      .post(sessionUrlDiscount, JSON.stringify(dataDiscount), {
        auth: {
          username: storeAPIkey,
          password: storePassword,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        const discountedUrl = `http://${storeMyShopify}/discount/${randomString}`;
        console.log('test link is: ', discountedUrl);
        return response;
      })
      .catch((error) => {
      // handle error
        console.log('@@@@@@@@@@ERROR AT DISCOUNT CREATE:   ', error);
        return false;
      });
  };
  const retireveProducts = async () => {
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        'X-Shopify-Storefront-Access-Token': accessToken,
      },
    });

    const query = gql`
      {
        products(first: 5) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;
    const data = await graphQLClient.request(query);
    return data;
  };

  const getProductsByCollectionHandle = async (
    handle,
  ) => {
    const endpoint = `https://${storeAPIkey}:${storePassword}@${storeMyShopify}/admin/api/${apiVersion}/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint);

    const query = gql`
      {
        collectionByHandle(handle: "${handle}") {
          products(first: 10) {
            edges {
              node {
                id
                handle
                title
                description
              }
            }
          }
        }
      }
    `;
    return graphQLClient.request(query);
  };

  const retireveVariantsOfProduct = async (
    productID,
  ) => {
    const endpoint = `https://${storeAPIkey}:${storePassword}@${storeMyShopify}/admin/api/${apiVersion}/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint);

    const query = gql`
      {
        node(id: "${productID}") {
          id
          ... on Product {
            variants(first: 5) {
              edges {
                node {
                  id
                  availableForSale
                  title
                  image {
                    originalSrc
                  }
                }
              }
            }
          }
        }
      }
    `;
    return graphQLClient.request(query);
  };

  const getAllOrders = async () => {
    const enterDate = new Date();
    enterDate.setDate(enterDate.getDate() - 5);
    let newDate = enterDate.toISOString();
    newDate = newDate.substring(0, newDate.length - 5);
    const urlLastOrders = `https://${storeAPIkey}:${storePassword}@${storeMyShopify}/admin/api/${apiVersion}/orders.json?updated_at_min=${newDate}`;

    return axios
      .get(urlLastOrders, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        console.log(response);
        return response;
      })
      .catch((error) => {
      // handle error
        console.log('error', error);
        return false;
      });
  };

  const addWebhookFulfillmentUpdate = async () => {
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        'X-Shopify-Storefront-Access-Token': accessToken,
      },
    });

    const query = `mutation
        mutation webhookSubscriptionCreate(
          $topic: WebhookSubscriptionTopic!, 
          $webhookSubscription: WebhookSubscriptionInput!) {
          webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
            userErrors {
              field
              message
            }
            webhookSubscription {
              id
            }
          }
        }`;

    const variables = {
      topic: 'FULFILLMENTS_UPDATE',
      webhookSubscription: {
        callbackUrl: 'https://saletasticdev.herokuapp.com/shopify/webhooks/fulfillments/update',
        format: 'JSON',
      },
    };

    console.log('Successfully registered FULFILLMENTS_UPDATE webhook!');

    return graphQLClient.request(query, variables);
  };

  const shopifyApi = {
    retireveCollections,
    retireveProducts,
    getProductsByCollectionHandle,
    retireveVariantsOfProduct,
    getAllOrders,
    shopifyDiscountCreate,
    addWebhookFulfillmentUpdate,
  };
  return shopifyApi;
};
