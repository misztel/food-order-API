const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  desc: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean
  },
  wrapping: {
    type: Boolean
  },
  itemCategory: {
    type: Schema.Types.ObjectId,
    ref: 'ItemCategory',
    required: true
  },
  itemOptions: [{
    optionId: { type: Schema.Types.ObjectId, ref: 'ItemOption' }
  }]
});

module.exports = mongoose.model('Item', itemSchema);
