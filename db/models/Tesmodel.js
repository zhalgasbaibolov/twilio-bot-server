/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');

const connectionUrl = '';
const { Schema } = mongoose;
if (mongoose.connection.readyState === 0) {
  mongoose.connect(connectionUrl)
    .catch((err) => {
      console.error('mongoose Error', err);
    });
}

const TesmodelSchema = new Schema({

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TesmodelSchema.pre('save', function preSave(next) {
  this.updatedAt = Date.now();
  next();
});

TesmodelSchema.pre('update', function preUpdate() {
  this.constructor.update({ _id: this._id }, { $set: { updatedAt: Date.now() } });
});

TesmodelSchema.pre('findOneAndUpdate', function preFindAndUpdate() {
  this.constructor.update({ _id: this._id }, { $set: { updatedAt: Date.now() } });
});

/** @name db.Tesmodel */
module.exports = mongoose.model('Tesmodel', TesmodelSchema);
