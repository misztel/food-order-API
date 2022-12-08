const mongoose = require('mongoose');

const { Schema } = mongoose;

const verificationCodeSchema = new Schema({
  code: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  // add ref to orders schema
  // orders: [{
  //   type: Schema.Types.ObjectId,
  //   ref: 'Post'
  // }]
});

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
