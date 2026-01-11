const Order = require('../models/orders/order.model');
const Product = require('../models/others/product.model');
const Notification = require('../models/others/notification.model');
const { isUserOnline } = require('../services/sse.service');
const ApiError = require('../utils/ApiError');
const { sendResponse } = require('../utils/ApiResponse');
const PriceHistory = require('../models/others/price_history');

async function getProducts(req, res, next) {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const query = {};

        query.isDeleted = false;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
            ];
        }

        const products = await Product.find(query)
            .select("-__v -updatedAt -priceFeedSubscribers")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            

        const count = products.length;
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

async function createProduct(req, res, next) {
    try {
        const { title, description, brand, expiry, price } = req.body;

        if (!title || !description || !brand || !expiry || !price) {
            throw new ApiError(400, "All fields are required");
        }

        if (isNaN(price)) {
            throw new ApiError(400, "Price must be a number");
        }

        if (new Date(expiry) <= new Date()) {
            throw new ApiError(400, "Expiry date must be in the future");
        }

        const product = await Product.create({
            title,
            description,
            brand,
            expiry: new Date(expiry),
            price: Number(price) * 100
        });

        sendResponse(res, 201, product, "Product created successfully");
    } catch (error) {
        next(error)
    }
}

async function createManyProducts(req, res, next) {
    const products = req.body.map(product => ({...product, price: Number(product.price)*100, expiry: new Date(product.expiry)}))
    try {
        await Product.insertMany(products);

        sendResponse(res, 201, null, "Products created successfully");
    } catch (error) {
        next(error)
    }
}



// todo: isDelete is true, throw error
async function updateProduct(req, res, next) {
    try {
        const { id } = req.params;
        const { title, description, brand, expiry, price } = req.body;

        const product = await Product.findById(id);

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        if (price && isNaN(price)) {
            throw new ApiError(400, "Price must be a number");
        }

        if (expiry && new Date(expiry) <= new Date()) {
            throw new ApiError(400, "Expiry date must be in the future");
        }

        const oldPrice = product.price;

        product.title = title || product.title;
        product.description = description || product.description;
        product.brand = brand || product.brand;
        product.expiry = expiry ? new Date(expiry) : product.expiry;
        product.price = price ? Number(price) * 100 : product.price;

        if(price) {
            const notifications = product.priceFeedSubscribers.map(subscriberId => ({
                user: subscriberId,
                product: id,
                oldPrice: oldPrice,
                newPrice: price*100
            }));

            const createPriceHistory = new PriceHistory({
                product: id,
                price: price*100,
                updateBy: req.user.id
            });

            product.priceHistory.addToSet(createPriceHistory._id);
            await Notification.insertMany(notifications);
            await createPriceHistory.save();
        }

        await product.save();
        sendResponse(res, 200, product, "Product updated successfully");
    } catch (error) {
        next(error);
    }
}


async function updateProductPrice(req, res, next) {
  try {
    const { productId } = req.params;
    const { newPrice } = req.body;

    // Get current product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update price
    const oldPrice = product.price * 100; // # tranform-utility
    product.price = newPrice; // # tranform-utility
    await product.save();

    // Create notifications for all subscribers
    const notifications = product.priceFeedSubscribers.map(subscriberId => ({
      user: subscriberId,
      product: productId,
      oldPrice,
      newPrice
    }));

    await Notification.insertMany(notifications);

    // Immediately notify online subscribers
    /**
        product.priceFeedSubscribers.forEach(subscriberId => {
        if (isUserOnline(subscriberId)) {
            const eventData = {
            type: 'PRICE_UPDATE',
            productId: product._id,
            productTitle: product.title,
            oldPrice,
            newPrice,
            updatedAt: new Date()
            };
            sseService.sendEventToUser(subscriberId, eventData);
            
            // Mark as delivered in background
            Notification.updateOne(
            { user: subscriberId, product: productId, delivered: false },
            { delivered: true }
            ).exec();
        }
        });
    */

    sendResponse(res, 200, product, 'Price updated successfully');
  } catch (error) {
    next(error)
  }
};



async function deleteProduct(req, res, next) {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        product.isDeleted = true;
        product.deletedAt = new Date();
        await product.save();

        return sendResponse(res, 200, null, "Product deleted successfully");

    } catch (error) {
        next(error);
    }

}



/// Order
// simulate order status change for user order
async function getExecutableOrders(req, res, next) {
   try {
     const orders = await Order.find({$or: [
         {orderStatus: 'initiated'}, 
         {orderStatus: 'shipped'}]
     }).select('_id userId orderStatus amount');
 
     sendResponse(res, 200, orders);
   } catch (error) {
        next(error)
   }
}


async function updateOrderStatus(req, res, next) {
    const { orderStatus } = req.body;
    const { orderId } = req.params;

    try {
        await Order.findByIdAndUpdate(orderId, {
            orderStatus: 'shipped'
        });

    } catch (error) {
        next(error)
    }
}



module.exports = {
    getProducts,
    createProduct,
    createManyProducts,
    updateProduct,
    updateProductPrice,
    deleteProduct,

    updateOrderStatus,
    getExecutableOrders
}