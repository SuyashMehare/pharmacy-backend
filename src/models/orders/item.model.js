const { default: mongoose } = require("mongoose");

const ItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    },
    price: {
        type: Number
    },
    quantity: {
        type: Number,
        default: 1
    },
    total: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model('Item', ItemSchema);