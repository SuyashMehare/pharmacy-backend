
const Cart = require('../models/others/cart.model')
const Transaction_Order = require('../models/orders/transaction_order');
const Notification = require("../models/others/notification.model");
const Transaction = require('../models/orders/transaction.model');
const Order = require('../models/orders/order.model');
const Item = require('../models/orders/item.model');
const Product = require('../models/others/product.model');
const ApiError = require('../utils/ApiError');
const { sendResponse } = require('../utils/ApiResponse');
const { default: mongoose } = require('mongoose');
const { sendEventToUser, addClient } = require('../services/sse.service');
const RegularUser = require('../models/users/regularUser.model');

async function getProducts(req, res, next) {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const query = {};

        query.isDeleted = false;
        // query.expiry = { $gt: new Date() }; //todo: expired products shount be consider
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
            ];
        }

        let products = await Product.find(query)
            .select("-priceFeedSubscribers -__v -isDeleted -updatedAt")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .lean()

        const count = products.length;

        if(req.isAuthUserReq) {
            const oIds = (await RegularUser.findById(req.userId).select("subscribedPriceFeeds -_id -kind")).subscribedPriceFeeds;
            const subscribeProductPrices = new Set(oIds.map((_a) =>_a.toString()));

            products = products.map((product) => ({ 
                ...product, 
                isSubscribed: subscribeProductPrices.has(product._id.toString()) 
            }));
        }
        
        sendResponse(res, 200, {
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalItems: count
        }, "Products retrieved successfully");
    } catch (error) {
        next(error);
    }
}

async function getProductById(req, res, next) {
    try {
        const { productId } = req.params;        
        const product = await Product.findById(productId)
        .select('-priceFeedSubscribers -isDeleted -__v -updatedAt');
        
        if (!product) {
            throw new ApiError(404, "Product not found or expired");
        }

        sendResponse(res, 201, product, "Product fetched. Id: " + productId);
    } catch (error) {
        next(error);
    }
}

async function getUserNotifications(req, res, next) {
    const userId = req.user.id;
    const userNotifications = await Notification.find({ user: userId, readed: false }).select("-__v  -delivered -updatedAt");

    sendResponse(res, 200, userNotifications, 'User notifications fetched successfully');
}


async function subscribeProductPrice(req, res, next) {
    const { productId } = req.params;
    const userId = req.user.id;

    try {
        const product = await Product.findByIdAndUpdate(productId, {
            $addToSet: { priceFeedSubscribers: userId },
        }, { new: true })

        await RegularUser.findByIdAndUpdate(userId,{
            $addToSet: { subscribedPriceFeeds: productId }
        })


        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // addClient(userId, res);

        // const pendingNotifications = await Notification.find({
        //     user: userId,
        //     product: productId,
        //     delivered: false
        // });


        // for (const notification of pendingNotifications) {
        //     const eventData = {
        //         type: 'PRICE_UPDATE',
        //         productId: product._id,
        //         productTitle: product.title,
        //         oldPrice: notification.oldPrice,
        //         newPrice: notification.newPrice,
        //         updatedAt: notification.createdAt
        //     };

        //     sendEventToUser(userId, eventData);
        //     notification.delivered = true;
        //     await notification.save();
        // }

        sendResponse(res, 201, null, 'User successfully subscribed product ' + productId)
    } catch (error) {
        next(error);
    }
}

async function unsubscribeFromProduct(req, res, next) {
    try {
        const { productId } = req.params;
        const userId = req.user.id;
        
        // Remove user from product's subscribers
        await Product.findByIdAndUpdate(productId, {
            $pull: { priceFeedSubscribers: new mongoose.Types.ObjectId(userId) }
        });
        
        await RegularUser.findByIdAndUpdate(userId, {
            $pull: { subscribedPriceFeeds: new mongoose.Types.ObjectId(productId) }
        })

        // Close SSE connection if it exists
        // removeClient(userId);

        res.json({ success: true, message: 'Unsubscribed successfully' });
        sendResponse(res, 201, null, 'Unsubscribed successfully product ' + productId)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/***
 *  Orders
 */

/**
 * orderId
 * orderStatus
 * items: [{
 *  itemId,
 *  productId,
 *  productName,
 *  productPrice,
 *  quantity,
 *  totalItemAmount
 * }]
 * totalOrderAmount
 */


async function getOrderHistory(req, res, next) {
    const userId = req.user.id

    try {
        const orders = await Order.aggregate([
            {
                $match:
                {
                    userId: userId,
                },
            },
            {
                $lookup: {
                    from: "items",
                    localField: "items",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $lookup: {
                                from: "products",
                                localField: "product",
                                foreignField: "_id",
                                as: "items_product",
                            },
                        },
                        {
                            $project: {
                                productName: {
                                    $arrayElemAt: [
                                        "$items_product.title",
                                        0,
                                    ],
                                },
                                totalItemAmount: {
                                    $multiply: ["$quantity", "$price"],
                                },
                                productPrice: "$price",
                                productId: "$product",
                                quantity: 1,
                                itemId: "$_id",
                                _id: 0,
                            },
                        },
                    ],
                    as: "result",
                },
            },
            {
                $project: {
                    orderId: "$_id",
                    orderStatus: 1,
                    items: "$result",
                    totalOrderAmount: "$amount",
                    _id: 0,
                },
            },
        ])
        sendResponse(res, 200, orders, 'All orders')
    } catch (error) {
        next(error)
    }
}


async function createOrder(req, res, next) {
    const userId = req.user.id;
    const { userOrders } = req.body; // [{productId, quantity}]

    const productIds = userOrders?.map((userOrder) => userOrder.productId); // [_ids];
    const orderIdToQuantity = userOrders?.reduce((acc, userOrder) => {
        acc[userOrder.productId] = userOrder.quantity
        return acc;
    }, {});


    let session = null;
    try {
        const products = await Product.find({ _id: productIds }).select('price');

        if (products.length === 0)
            throw new ApiError(403, 'Product list can not be empty');


        const productItems = products.map(product => ({
            product: product._id,
            quantity: orderIdToQuantity[product._id],
            price: product.price,
            total: orderIdToQuantity[product._id] * product.price
        }))


        session = await mongoose.startSession();
        session.startTransaction();

        const items = await Item.insertMany(productItems, { session });
        const totalItemsAmount = items.reduce((acc, val) => acc + val.total, 0);

        const order = await Order.insertOne({
            userId,
            amount: totalItemsAmount,
            items: items.map(item => item._id)
        }, { session });

        const transaction = await Transaction.insertOne({ amount: order.amount }, { session });
        await Transaction_Order.create({ txId: transaction._id, orderId: order._id }, { session });

        const body = {
            txId: transaction._id.toString(),
            amount: transaction.amount,
            to: process.env.PHARMACY_BANK_ACCOUNT_NO
        }

        const rezorpayRes = await fetch(`${process.env.REZORPAY_URL}/rezorpay/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })

        const rezorpayJsonRes = await rezorpayRes.json();

        if (!rezorpayJsonRes.success)
            throw new ApiError(500, 'Transaction creation failed')

        await session.commitTransaction();
        sendResponse(res, 201, { transactionId: transaction._id }, 'Transaction created.')
    } catch (error) {
        await session.abortTransaction();
        next(error)
    } finally {
        session.endSession()
    }

}


async function abortOrder(req, res, next) {

}



/**
 * Cart
 */

/**
async function addToCart(req, res, next) {
    const { productId } = req.body;
    try {
        await Cart.findOneAndUpdate({user: req.user.id}, {
            $push: {
                product: productId
            }
        })
        
    } catch (error) {
        next(error);
    }
}

async function removeFromCart(req, res, next) {
    const { productId } = req.body;
    try {
        await Cart.findOneAndUpdate({user: req.user.id}, {
            $pull: {
                product: productId
            }
        })
        
    } catch (error) {
        next(error);
    }
}


async function fetchCart(req, res, next) {
    try {
        const cart = await Cart.findOne({user: req.user.id}).populate('product');
        sendResponse(res, 200, cart);
    } catch (error) {
        next(error);
    }
}
*/


module.exports = {
    getProducts,
    getProductById,
    getUserNotifications,
    subscribeProductPrice,
    unsubscribeFromProduct,
    getOrderHistory,
    createOrder,
    abortOrder
}