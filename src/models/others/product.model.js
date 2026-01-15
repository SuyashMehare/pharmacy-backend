const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    banner_url: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        enum: {
            values: ['INR'],
            message: '{VALUE} is not supported'
        }
    },
    priceFeedSubscribers: [{
        type: mongoose.Types.ObjectId,
        ref: 'RegularUser'
    }],
    priceHistory: [{
        type: mongoose.Types.ObjectId,
        ref: 'PriceHistory'
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);