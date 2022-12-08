const mongoose = require('mongoose');

const { Schema } = mongoose;

const deckSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  tags: {
    type: Schema.Types.ObjectId,
    ref: 'Tag',
    required: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cards: [{
    type: Schema.Types.ObjectId,
    ref: 'Card'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Deck', deckSchema);
