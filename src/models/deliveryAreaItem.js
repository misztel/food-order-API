const mongoose = require('mongoose');

const { Schema } = mongoose;

const deliveryAreaItemSchema = new Schema({
  deliveryAreaId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  radius: {
    type: Number,
    required: false
  },
  name: {
    type: String,
    required: false
  },
  polygon: [
    {
      lat: {
        type: Number,
        required: false
      },
      lng: {
        type: Number,
        required: false
      }
    }
  ]
});

module.exports = mongoose.model('DeliveryAreaItem', deliveryAreaItemSchema);
