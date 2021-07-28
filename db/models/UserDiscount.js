/* eslint-disable no-console */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const userDiscountSchema = new Schema({
  phone: { type: String, required: true },
  discountCode: { type: String, required: true },
  notifiedCount: { type: Number, default: 0 },
}, {
  collection: 'userDiscount',
  timestamps: true,
});

module.exports = mongoose.model('UserDiscount', userDiscountSchema);
