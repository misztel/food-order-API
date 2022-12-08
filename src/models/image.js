const mongoose = require('mongoose');

const { Schema } = mongoose;

const imageSchema = new Schema({
  name: {
    type: String,
    default: 'none',
    required: true
  },
  data: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Image', imageSchema);
