/* eslint-disable no-console */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const userContactSchema = new Schema({
  shopUrl: { type: String, required: true },
  country: { type: String, required: false },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  phone: { type: String, required: true },
  contactType: { type: String, required: true },
  // memberStackID: { type: String, required: true },
}, {
  collection: 'userContacts',
  timestamps: true,
});

module.exports = mongoose.model('UserContact', userContactSchema);
