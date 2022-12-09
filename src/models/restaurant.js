const mongoose = require('mongoose');

const { Schema } = mongoose;

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  placeId: {
    type: String,
    required: true
  },
  deliveryEnabled: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  },
  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }],
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'Item'
  }],
  itemCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'ItemCategory'
  }]
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
