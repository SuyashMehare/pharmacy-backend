const { default: mongoose } = require("mongoose");

const Transaction_Order_Shema = new mongoose.Schema({
    txId: {
        type: String,
        ref: 'Transaction'
    },
    orderId: {
        type: mongoose.Types.ObjectId,
        ref: 'Order'
    }
});

Transaction_Order_Shema.index({ txId: 1});
Transaction_Order_Shema.index({ orderId: 1});

module.exports = mongoose.model('Transaction_Order', Transaction_Order_Shema);