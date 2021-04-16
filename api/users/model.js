const mongoose = require('mongoose');

const collection = 'users';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model(collection, schema);

module.exports = User ;
