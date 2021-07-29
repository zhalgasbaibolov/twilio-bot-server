/* eslint-disable no-console */
const mongoose = require('mongoose');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const { Schema } = mongoose;

const userGetSupport = new Schema({
  phone: { type: String, required: true },
  text: { type: String },
}, {
  collection: 'userGetSupport',
  timestamps: true,
});

module.exports = mongoose.model('UserGetSupport', userGetSupport);
