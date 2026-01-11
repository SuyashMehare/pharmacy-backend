const { default: mongoose, Schema } = require("mongoose");

const PriceHistorySchema = new Schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    },
    price: Number,
    updateBy: {
        type: mongoose.Types.ObjectId,
        ref: 'AdminUser'
    }
}, { timestamps: true });

module.exports = mongoose.model('PriceHistory', PriceHistorySchema);