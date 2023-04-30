const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemSchema = new Schema({
  orderKey: {
    type: Number,
    required: true
  },
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
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  itemOptionsGroup: [{
    optionId: { type: Schema.Types.ObjectId, ref: 'ItemOptionGroup' }
  }]
});

module.exports = mongoose.model('Item', itemSchema);
