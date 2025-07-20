const mongoose = require('mongoose');
const BaseUser = require('./baseUser.model');

const Schema = mongoose.Schema;

const adminUserSchema = new Schema({
  permissions: {
    manageUsers: { type: Boolean, default: false },
    manageInventory: { type: Boolean, default: false },
    manageOrders: { type: Boolean, default: false },
    manageVendors: { type: Boolean, default: false },
    systemSettings: { type: Boolean, default: false }
  },
  lastAccess: Date,
});

const AdminUser = BaseUser.discriminator('AdminUser', adminUserSchema);
module.exports = AdminUser;