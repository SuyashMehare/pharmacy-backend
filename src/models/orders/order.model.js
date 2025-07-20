const { default: mongoose } = require("mongoose");

const OrderShema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'RegularUser'
    },
    orderStatus: {
        type: String,
        enum: {
            values: ['not_initiated', 'initiated', 'aborted', 'shipped', 'delivered'],
            message: '${VALUE} is not valid order status type'

        },
        default: 'not_initiated'
    },
    items: [{
        type: mongoose.Types.ObjectId,
        ref: 'Item'
    }],
    amount: { // total amount to pay
        type: Number,
        required: true
    },

    aboartReason: String,

}, {timestamps: true});

module.exports = mongoose.model('Order', OrderShema);