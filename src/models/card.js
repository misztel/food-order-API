const mongoose = require('mongoose');

const { Schema } = mongoose;

const cardSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deck: {
    type: Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);
