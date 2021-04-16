const mongoose = require('mongoose');

const collection = 'tweets';

const schema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: String, required: true },
  userId: { type: String, required: true },
  comments: { type: String, required: true },
});

const model = mongoose.model(collection, schema);

module.exports = { model };
