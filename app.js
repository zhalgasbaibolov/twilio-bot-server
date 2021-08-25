/* eslint-disable no-console */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const a = 'abdc276bca5';
const b = '995f447d05d';
const c = 'f1e9610526';
const accountSid = 'AC4352390b9be632aabb39a3b9282dc338';
const authToken = `${a}${b}${c}`;
const client = require('twilio')(accountSid, authToken);
const { abandonedCartsTracker } = require('./filesWIthInterval/abandonedCartsTracker');
const { newContactsTracker } = require('./filesWIthInterval/newContactsTracker');

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

const app = express();

const twilioNumber = '+19286156092';

app.post('/send-message', async (req, res) => {
  try {
    const response = await client.messages.create({
      body: req.body.message,
      from: twilioNumber,
      to: req.body.to,
    });
    console.log(`\n\n\n++++++++++++++++++++++++++\n
    \nMessage Sent To ${req.body.to}\n\n+++++++++++++++++++++++++++++\n\n\n`);
    res.status(200).json({
      response,
      message: `Message Sent To ${req.body.to}`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      Error: err,
    });
  }
});

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
