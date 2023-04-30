const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemOptionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number
  },
  itemOptionsGroup: {
    type: Schema.Types.ObjectId,
    ref: 'ItemOptionsGroup'
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  }
});

module.exports = mongoose.model('ItemOption', itemOptionSchema);
