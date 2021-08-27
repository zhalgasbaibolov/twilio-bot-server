/* eslint-disable no-console */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const { abandonedCartsTracker } = require('./filesWIthInterval/abandonedCartsTracker');
const { newContactsTracker } = require('./filesWIthInterval/newContactsTracker');
const getAllContacts = require('./getAllContacts');

// Set up default mongoose connection
const mongoDB = 'mongodb+srv://nurlan:qweQWE123@cluster0.ikiuf.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('open', () => {
  abandonedCartsTracker();
  newContactsTracker();
});

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const whRouter = require('./routes/wh');
const awhRouter = require('./routes/awh');
const settingsRouter = require('./routes/settings');
const shopifyRouter = require('./routes/shopifyWebhooks');
const smsRouter = require('./routes/smsRouter');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false,
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wh', whRouter);
app.use('/awh', awhRouter);
app.use('/settings', settingsRouter);
app.use('/shopify', shopifyRouter);
app.use('/twilioapi/send', smsRouter);
app.get('/twilioapi/get/contacts', async (req, res) => {
  res.status(200).send(await getAllContacts());
});

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
