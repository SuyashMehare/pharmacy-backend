// tx: ['pending', 'aborted', 'success'
// order: ['not_initiated', 'initiated', 'aborted', 'shipped', 'delivered']

const { default: mongoose } = require("mongoose");
const Order = require("../models/orders/order.model");
const Transaction = require("../models/orders/transaction.model");
const Transaction_Order = require("../models/orders/transaction_order");
const { sendResponse } = require("../utils/ApiResponse");

// It updates tx status to 'success' And order status to 'initiated'
async function updateTxSuccessAndOrderInititated(req, res, next) {
    const { txId } = req.body;
    console.log('Called with tx id: ',txId);
    
    let session = null;

    try {
        session  = await mongoose.startSession()
        session.startTransaction()
        await Transaction.findByIdAndUpdate(txId, {status: 'success'}, { session })
        const txOrder = await Transaction_Order.findOne({txId}, null, { session })
        console.log("tx_order", txOrder.txId, txOrder.orderId);
        
        await Order.findByIdAndUpdate(txOrder.orderId, {orderStatus: 'initiated'}, { session })

        await session.commitTransaction()
        sendResponse(res, 204)
    } catch (error) {
        await session.abortTransaction()
        next(error);
    } finally {
        await session.endSession()
    } 
}

module.exports = {
    updateTxSuccessAndOrderInititated
}