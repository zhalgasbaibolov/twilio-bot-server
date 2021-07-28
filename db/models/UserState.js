/* eslint-disable no-console */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const userStateSchema = new Schema({
  phone: { type: String, required: true },
  last: { type: String, required: false, default: 'test last' },
  catalogs: [Object],
  products: [Object],
  variants: [Object],
  lastCheckoutInfo: Object,
  storedLineItems: [Object],
}, { collection: 'userStates' });

module.exports = mongoose.model('UserState', userStateSchema);
