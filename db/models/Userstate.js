/* eslint-disable no-console */
const mongoose = require('mongoose');

// Set up default mongoose connection
const mongoDB = 'mongodb+srv://nurlan:qweQWE123@cluster0.ikiuf.mongodb.net/twiliodb?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const { Schema } = mongoose;

const userStateSchema = new Schema({
  phone: { type: String, required: true },
  last: { type: String, required: false },
});

module.exports = mongoose.model('UserState', userStateSchema);
