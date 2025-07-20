const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vendorUserSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'BaseUser', 
    required: true,
    unique: true
  },
  companyInfo: {
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['manufacturer', 'distributor', 'wholesaler', 'retail'],
      required: true
    },
    taxId: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    licenseExpiry: Date
  },
  contactInfo: {
    phone: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'US' }
    },
    website: String
  },
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  approvalDate: Date,
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    reviews: [{
      user: { type: Schema.Types.ObjectId, ref: 'RegularUser' },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      date: { type: Date, default: Date.now }
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VendorUser', vendorUserSchema);