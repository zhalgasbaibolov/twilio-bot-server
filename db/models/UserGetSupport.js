/* eslint-disable no-console */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const userGetSupport = new Schema({
  profileName: { type: String, requried: false },
  accountSid: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  owner: { type: String, required: true, default: 'user' },
  text: { type: String },
}, {
  collection: 'userGetSupports',
  timestamps: true,
});

module.exports = mongoose.model('UserGetSupport', userGetSupport);
