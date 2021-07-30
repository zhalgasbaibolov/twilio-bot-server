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
  const shopifyDiscountCreate = async (
    randomString,
  ) => {
    const dataDiscount = {
      discount_code: {
        code: randomString,
      },
    };

    const sessionUrlDiscount = `https://${storeMyShopify}/admin/api/${apiVersion}/price_rules/${priceRuleId}/discount_codes.json`;
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

  const getAllOrders = async ({
    enterDate = new Date(),
  }) => {
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
  };
  return shopifyApi;
};
