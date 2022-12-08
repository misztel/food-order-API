const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemOptionsGroupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  isRequired: {
    type: Boolean,
    required: true
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  itemOptions: [{
    itemOption: { type: Schema.Types.ObjectId, ref: 'Item' }
  }]
});

module.exports = mongoose.model('ItemOptionsGroup', itemOptionsGroupSchema);
