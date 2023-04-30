const mongoose = require('mongoose');

const { Schema } = mongoose;

const hourSchema = new Schema({
  day: {
    type: Number,
    required: true
  },
  open: {
    type: Number,
    required: true
  },
  close: {
    type: Number,
    required: true
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  }
});

module.exports = mongoose.model('Hour', hourSchema);
