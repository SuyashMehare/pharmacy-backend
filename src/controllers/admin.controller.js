const Product = require('../models/others/product.model');
const ApiError = require('../utils/ApiError');
const { sendResponse } = require('../utils/ApiResponse');

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
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

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

        product.title = title || product.title;
        product.description = description || product.description;
        product.brand = brand || product.brand;
        product.expiry = expiry ? new Date(expiry) : product.expiry;
        product.price = price ? Number(price) * 100 : product.price;
        console.log(product.toObject(), price ? Number(price) * 100 : product.price);
        
        await product.save();
        sendResponse(res, 200, product, "Product updated successfully");
    } catch (error) {
        next(error);
    }
}

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

async function updateOrderStatus(req, res, next) {
    

}



module.exports = {
    getProducts,
    createProduct,
    createManyProducts,
    updateProduct,
    deleteProduct,

    updateOrderStatus
}