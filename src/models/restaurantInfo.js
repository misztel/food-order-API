const mongoose = require('mongoose');

const { Schema } = mongoose;

const restaurantInfoSchema = new Schema({
  desc: {
    type: String,
    required: true
  },
  localization: {
    type: String,
    required: true
  },
  hours: {
    type: String,
    required: true
  },
  deliverymin: {
    type: String,
    required: true
  },
  deliveryprice: {
    type: String,
    required: true
  },
  packageprice: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  }
});

module.exports = mongoose.model('RestaurantInfo', restaurantInfoSchema);
