/* eslint-disable no-console */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const userAbandonedDiscountSchema = new Schema({
  phone: { type: String, required: true },
  discountCode: { type: String, required: true },
  // memberStackID: { type: String, required: true },
  notifiedCount: { type: Number, default: 0 },
}, {
  collection: 'userAbandonedDiscounts',
  timestamps: true,
});

module.exports = mongoose.model('UserAbandonedDiscount', userAbandonedDiscountSchema);
