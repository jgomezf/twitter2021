const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { config } = require('../../config');

const collection = 'users';
const objectSchema = {
  name: { type: String, required: true },
  username: { type: String, required: true, lowercase: true, trim: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  active: {type: Boolean, required: true, default: true },
}
const options = {
  timestamps: true,
}

const schema = new mongoose.Schema(objectSchema, options);

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
