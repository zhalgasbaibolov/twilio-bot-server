const mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb+srv://nurlan:qweQWE123@cluster0.ikiuf.mongodb.net/twiliodb?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const { Schema } = mongoose;

const userDiscountSchema = new Schema({
    phone: { type: String, required: true },
    discountCode: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserDiscount', userDiscountSchema);