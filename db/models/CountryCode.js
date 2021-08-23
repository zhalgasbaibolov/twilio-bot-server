/* eslint-disable no-console */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const countryCodeSchema = new Schema({
  code: { type: String, required: true },
  map: { type: String, required: true },
  phoneCode: { type: String, required: true },
  countryName: { type: String, required: true },
}, {
  collection: 'countryCodes',
});

module.exports = mongoose.model('CountryCode', countryCodeSchema);
