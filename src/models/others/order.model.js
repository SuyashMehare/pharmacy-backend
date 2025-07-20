const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  orderedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'RegularUser', 
    required: true,
    unique: true
  },
  medicines: [{
    medicine: {
        type: Schema.Types.ObjectId, 
        ref: 'Medicine', 
    },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 }
  }],
  status: {
    type:String,
    enum: {
        values: ['']
    }
  },
  total: {
    type: Number,
    default: 0
  },

}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);