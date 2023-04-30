const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemOptionsGroupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  required: {
    type: Boolean
  },
  multiSelect: {
    type: Boolean
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  itemOptions: [{
    itemOption: { type: Schema.Types.ObjectId, ref: 'ItemOption' }
  }]
});

module.exports = mongoose.model('ItemOptionsGroup', itemOptionsGroupSchema);
