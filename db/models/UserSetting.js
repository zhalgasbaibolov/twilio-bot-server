/* eslint-disable no-console */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema({
  memberstackId: {
    type: String,
    required: true,
  },
  twilio: Object,
  shopify: Object,
}, {
  collection: 'userSettings',
  timestamps: true,
});

module.exports = mongoose.model('UserSetting', schema);
