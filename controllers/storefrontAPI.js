const {
    request,
    gql,
    GraphQLClient
} = require("graphql-request");

const retireveCollections = async(storeMyShopify, accessToken) => {
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
            "X-Shopify-Storefront-Access-Token": accessToken,
        },
    });

    const query = gql `
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

    // console.log(JSON.stringify(data, undefined, 2));
};

const retireveProducts = async(storeMyShopify, accessToken) => {
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
            "X-Shopify-Storefront-Access-Token": accessToken,
        },
    });

    const query = gql `
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

    console.log(JSON.stringify(data, undefined, 2));
};

const getProductsByCollectionHandle = async(
    storeMyShopify,
    accessToken,
    handle
) => {
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
            "X-Shopify-Storefront-Access-Token": accessToken,
        },
    });

    const query = gql `
    {
      collectionByHandle(handle: "${handle}") {
        products(first: 10) {
          edges {
            node {
              id
              handle
            }
          }
        }
      }
    }
  `;
    return graphQLClient.request(query);
};

const retireveVariantsOfProduct = async(
    storeMyShopify,
    accessToken,
    productID
) => {
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
            "X-Shopify-Storefront-Access-Token": accessToken,
            "Content-Type": "application/json",
        },
    });

    const query = gql `
    {
      node(id: "${productID}") {
        id
        ... on Product {
          variants(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  `;
    return graphQLClient.request(query);
};

const createCheckout = async(storeMyShopify, accessToken, variantId) => {
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
            "X-Shopify-Storefront-Access-Token": accessToken,
        },
    });

    const mutation = gql `
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
                variantId: variantId,
                quantity: 1
            }],
        },
    };
    return graphQLClient.request(mutation, variables);
};

const updateCheckout = async(storeMyShopify, accessToken, {
    checkoutId,
    lineItems
}) => {
    const endpoint = `https://${storeMyShopify}/api/2021-04/graphql.json`;

    const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
            "X-Shopify-Storefront-Access-Token": accessToken,
        },
    });

    const mutation = gql `
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
            lineItems: lineItems,
        },
    };
    return graphQLClient.request(mutation, variables);
}

exports.retireveCollections = retireveCollections;

exports.retireveProducts = retireveProducts;
exports.getProductsByCollectionHandle = getProductsByCollectionHandle;
exports.retireveVariantsOfProduct = retireveVariantsOfProduct;
exports.createCheckout = createCheckout;
exports.updateCheckout = updateCheckout;

module.exports = exports;