/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');

const { Schema } = mongoose;
if (mongoose.connection.readyState === 0) {
  mongoose.connect(require('../connection-config.js'))
    .catch((err) => {
      console.error('mongoose Error', err);
    });
}

const TesmodelSchema = new Schema({

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TesmodelSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

TesmodelSchema.pre('update', function () {
  this.constructor.update({ _id: this._id }, { $set: { updatedAt: Date.now() } });
});

TesmodelSchema.pre('findOneAndUpdate', function () {
  this.constructor.update({ _id: this._id }, { $set: { updatedAt: Date.now() } });
});

/** @name db.Tesmodel */
module.exports = mongoose.model('Tesmodel', TesmodelSchema);
