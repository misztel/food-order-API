const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemCategorySchema = new Schema({
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
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' }
  }]
});

module.exports = mongoose.model('ItemCategory', itemCategorySchema);
