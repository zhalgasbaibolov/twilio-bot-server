/* eslint-disable no-console */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const userContactSchema = new Schema({
  phone: { type: String, required: true },
  contactType: { type: String, required: true },
  // memberStackID: { type: String, required: true },
}, {
  collection: 'userContacts',
  timestamps: true,
});

module.exports = mongoose.model('UserContact', userContactSchema);
