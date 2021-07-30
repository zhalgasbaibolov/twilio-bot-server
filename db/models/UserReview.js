/* eslint-disable no-console */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const userReviewSchema = new Schema({
  phone: { type: String, required: true },
  text: { type: String },
}, {
  collection: 'userReviews',
  timestamps: true,
});

module.exports = mongoose.model('UserReview', userReviewSchema);
