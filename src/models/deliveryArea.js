const mongoose = require('mongoose');

const { Schema } = mongoose;

const deliveryAreaSchema = new Schema({
  restaurantId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  deliveryAreaItems: [{
    type: Schema.Types.ObjectId,
    ref: 'DeliveryAreaItem'
  }]
});

module.exports = mongoose.model('DeliveryArea', deliveryAreaSchema);
