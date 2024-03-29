const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemCategorySchema = new Schema({
  orderKey: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'Item'
  }]
});

module.exports = mongoose.model('ItemCategory', itemCategorySchema);
