const mongoose = require('mongoose');

const { Schema } = mongoose;

const cartSchema = new Schema({
  restaurantId: {
    type: String,
    required: true
  },
  userId: {
    type: String
  },
  products: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Item'
    },
    options: [{
      optionGroup: {
        type: Schema.Types.ObjectId,
        ref: 'ItemOptionsGroup'
      },
      option: {
        type: Schema.Types.ObjectId,
        ref: 'ItemOption'
      }
    }]
  }],
  productPrice: {
    type: Number,
    required: true
  },
  wrappingPrice: {
    type: Number,
    required: true
  },
  fullPrice: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Cart', cartSchema);
