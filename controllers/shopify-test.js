// const getAbandonedCart = require("./cartAbandonement").getAbandonedCart;
const {
  // retireveCollections,
  createCheckout,
  // queryProductVariants,
  // retireveProducts,
  // getProductsByCollectionHandle,
  // retireveVariantsOfProduct,
} = require('./storefrontAPI');

// const storeAPIkey = '0f6b58da9331414de7ed1d948c67ac35';
// const storePassword = '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';
const accessToken = '0386d977a264448a1b62c295ac542a0d';
const storeMyShopify = 'fat-cat-studio.myshopify.com';

// const handle = 'winter';
// const productID = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzY3NzM1MDczOTE2Nzk=';
const variantID = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC80MDEyMTM0MTg3MDI3MQ==';

// retireveCollections(storeMyShopify, accessToken).then(res => console.log(res.collections.edges))
// getProductsByCollectionHandle(storeMyShopify, accessToken, handle)
// .then(res => console.log(res.collectionByHandle.products.edges))
// retireveVariantsOfProduct(storeMyShopify, accessToken, productID
// ).then(res => console.log(res.node.variants.edges))
createCheckout(storeMyShopify, accessToken, variantID).then(console.log);
