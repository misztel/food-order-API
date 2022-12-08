const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemOptionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  itemOptionsGroup: {
    type: Schema.Types.ObjectId,
    ref: 'ItemOptionsGroup'
  }
});

module.exports = mongoose.model('ItemOption', itemOptionSchema);
