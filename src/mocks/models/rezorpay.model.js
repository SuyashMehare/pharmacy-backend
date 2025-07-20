const { default: mongoose } = require("mongoose");

const RezorpayShema = new mongoose.Schema({
    txId: {
        type: String,
        require: true
    },
    fromAccountNo: {
        type: String,
    },
    toAccountNo: {
        type: String,
        require: true
    },
    amount: {
        type: Number,
        require: true,
        default: 0
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'paid', 'abort'],
            message: '${VALUE} is invalid status',
            default: 'pending'
        }
    },
    abortReason: String
});

module.exports = mongoose.model('Rezorpay', RezorpayShema);