/* eslint-disable no-console */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const userGetSupport = new Schema({
  accountSid: { type: String, required: true },
  phone: { type: String, required: true },
  text: { type: String },
}, {
  collection: 'userGetSupports',
  timestamps: true,
});

module.exports = mongoose.model('UserGetSupport', userGetSupport);
