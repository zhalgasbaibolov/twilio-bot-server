/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const express = require('express');

const router = express.Router();
const shopifyCtrl = require('../controllers/shopifywebhook');

router.post('/webhooks/fulfillments/create', async (req, res) => {
  console.log('🎉 We got a fulfillment create!');
  // const hmac = req.get('X-Shopify-Hmac-Sha256');
  // const body = await getRawBody(req);
  return res.status(200);
});

module.exports = router;
