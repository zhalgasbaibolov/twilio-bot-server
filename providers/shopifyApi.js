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
  console.log(settings);
  const retireveCollections = async () => {
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        'X-Shopify-Storefront-Access-Token': accessToken,
      },
    });

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
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        'X-Shopify-Storefront-Access-Token': accessToken,
      },
    });

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
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        'X-Shopify-Storefront-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

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

  const createCheckout = async (variantId) => {
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        'X-Shopify-Storefront-Access-Token': accessToken,
      },
    });

    const mutation = gql`
      mutation checkoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
            lineItems(first: 20) {
              edges {
                node {
                  id
                  title
                  quantity
                }
              }
            }
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }
    `;
    const variables = {
      input: {
        lineItems: [{
          variantId,
          quantity: 1,
        }],
      },
    };
    return graphQLClient.request(mutation, variables);
  };
  const createCheckoutList = async (lineItems) => {
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        'X-Shopify-Storefront-Access-Token': accessToken,
      },
    });

    const mutation = gql`
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
          lineItems(first: 20) {
            edges {
              node {
                id
                title
                quantity
              }
            }
          }
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;
    const variables = {
      input: {
        lineItems,
      },
    };
    return graphQLClient.request(mutation, variables);
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

  const updateCheckout = async ({
    checkoutId,
    lineItems,
  }) => {
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        'X-Shopify-Storefront-Access-Token': accessToken,
      },
    });

    const mutation = gql`
      mutation checkoutLineItemsReplace($lineItems: [CheckoutLineItemInput!]!, $checkoutId: ID!) {
        checkoutLineItemsReplace(lineItems: $lineItems, checkoutId: $checkoutId) {
          checkout {
            id
            lineItems(first:25){
              edges{
                node{
                  id
                  title
                  quantity
                }
              }
            }
          }
          userErrors {
            code
            field
            message
          }
        }
      }
  `;
    const variables = {
      checkoutId,
      lineItems,
    };

    return graphQLClient.request(mutation, variables);
  };

  // const webhookOrderCreate = async () => {
  //   const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

  //   const graphQLClient = new GraphQLClient(endpoint, {
  //     headers: {
  //       'X-Shopify-Storefront-Access-Token': accessToken,
  //     },
  //   });
  //   const mutation = gql`
  //   mutation webhookSubscriptionCreate(
  // $topic: WebhookSubscriptionTopic!,
  // $webhookSubscription: WebhookSubscriptionInput!)
  // {
  //     webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
  //       userErrors {
  //         field
  //         message
  //       }
  //       webhookSubscription {
  //         id
  //         email
  //         created_at
  //         total_price
  //         order_number
  //         discount_codes [
  //           {
  //             code
  //           }
  //         ]
  //         customer {
  //           phone
  //           first_name
  //         }
  //       }
  //     }
  //   }
  // `;
  //   // query variables
  //   const variables = {
  //     topic: 'ORDERS_CREATE',
  //     webhookSubscription: {
  //       callbackUrl: 'https://saletasticdev.herokuapp.com/shopify',
  //       format: 'JSON',
  //     },
  //   };
  //   return graphQLClient.request(mutation, variables);
  // };

  const shopifyApi = {
    retireveCollections,
    retireveProducts,
    getProductsByCollectionHandle,
    retireveVariantsOfProduct,
    createCheckout,
    createCheckoutList,
    updateCheckout,
    getAllOrders,
    shopifyDiscountCreate,
    // webhookOrderCreate,
  };
  return shopifyApi;
};
