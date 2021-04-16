const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { config } = require('../../config');

const collection = 'users';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

// hashes the password
schema.pre('save', function (next) {
  bcrypt.hash(this.password, config.saltRounds, (err, hash) => {
    if (err) {
      return next(err);
    }
    this.password = hash;
    next();
  });
});

schema.pre('updateOne', function (next) {
  const data = this.getUpdate()['$set'];

  bcrypt.hash(data.password, config.saltRounds, (err, hash) => {
    if (err) {
      return next(err);
    }
    data.password = hash;
    next();
  });
});

const User = mongoose.model(collection, schema);

module.exports = User;
