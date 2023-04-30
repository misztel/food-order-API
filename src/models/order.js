const mongoose = require('mongoose');

const { Schema } = mongoose;

const orderSchema = new Schema({
  orderNumber: {
    type: Number,
    required: true
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart'
  },
  orderDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  realizationType: {
    type: String,
    required: true
  },
  realizationTimeOption: {
    type: String,
    required: true
  },
  realizationTime: {
    type: Number,
    required: false
  },
  price: {
    cartPrice: {
      type: Number,
      required: true
    },
    deliveryPrice: {
      type: Number,
      required: true
    },
    wrappingPrice: {
      type: Number,
      required: true
    },
    finalPrice: {
      type: Number,
      required: true
    }
  },
  userData: {
    userId: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: true
    },
    surname: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  deliveryData: {
    locality: {
      type: String,
      required: false
    },
    street: {
      type: String,
      required: false
    },
    postalCode: {
      type: String,
      required: false
    },
    buildingNumber: {
      type: String,
      required: false
    },
    localNumber: {
      type: String,
      required: false
    },
    placeId: {
      type: String,
      required: false
    },
    distance: {
      type: Number,
      required: false
    },
    deliveryPrice: {
      type: Number,
      required: false
    }
  },
  payment: {
    status: {
      type: Boolean,
      required: true
    },
    paymentTypeValue: {
      type: String,
      required: true
    },
    paymentTypeName: {
      type: String,
      required: true
    }
  },
  other: {
    additionalInfo: {
      type: String,
      required: false
    },
    cutlery: {
      type: Boolean,
      required: false
    }
  },
  promo: {
    promoCode: {
      type: String,
      required: false
    },
    promoName: {
      type: String,
      required: false
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);
