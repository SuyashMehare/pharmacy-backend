const mongoose = require('mongoose');
const BaseUser = require('./baseUser.model');
const Schema = mongoose.Schema;

const regularUserSchema = new Schema({
  personalInfo: {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'US' }
    }
  },
  medicalInfo: {
    bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    allergies: [{
      name: String,
      severity: { type: String, enum: ['mild', 'moderate', 'severe'] }
    }],
    chronicConditions: [String],
    primaryPhysician: String
  },
  subscribedPriceFeeds: [{
    type: mongoose.Types.ObjectId,
    ref: 'Product'
  }],
});

const RegularUser = BaseUser.discriminator('RegularUser', regularUserSchema);
module.exports = RegularUser;