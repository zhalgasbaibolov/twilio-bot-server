/* eslint-disable no-console */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema({
  settingsId: { type: mongoose.Schema.Types.ObjectId, required: false },
  phone: { type: String, required: true },
}, { collection: 'approvedSandboxUsers' });

module.exports = mongoose.model('ApprovedSandboxUsers', schema);
