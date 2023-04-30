const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  access: {
    type: String,
    default: 'user' // user, admin, superadmin
  },
  phone: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  avatarUrl: {
    type: String,
    default: 'images/default/defaultavatar.png'
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  localNumber: {
    type: String,
    required: false
  },
  verified: {
    type: Boolean,
    required: true
  },
  verifyCode: [{
    type: Schema.Types.ObjectId,
    ref: 'VerificationCode'
  }],
  resetPasswordCode: {
    type: String,
    required: false
  },
  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }]
});

module.exports = mongoose.model('User', userSchema);
