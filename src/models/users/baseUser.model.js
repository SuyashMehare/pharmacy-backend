const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema;

const baseUserSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  role: { 
    type: String, 
    required: true,
    enum: ['regular', 'admin', 'vendor'],
    default: 'regular'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  lastLogin: Date,
}, {
  timestamps: true,
  discriminatorKey: 'kind',
  methods: {
    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password)
    }
  }
});

baseUserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


// baseUserSchema.method.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password)
// }

module.exports = mongoose.model('BaseUser', baseUserSchema);