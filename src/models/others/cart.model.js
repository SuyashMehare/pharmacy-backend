const { default: mongoose } = require("mongoose");

const CartShema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    product: [{
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    }],
    isOrdered: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Cart', CartShema);