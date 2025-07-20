const { default: mongoose } = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

// _id: points to rezorpay orderId/txId
const TransactionShema = new mongoose.Schema({
    _id: { 
        type: String,
        default: () => {
            const id = new mongoose.Types.ObjectId();
            return `TX${id.toString()}`;
        }
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'aborted', 'success'],
            message: '${VALUE} is not valid order status type'
        },
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true
    },
    abortReason: String
}, {timestamps: true});

module.exports = mongoose.model('Transaction', TransactionShema);