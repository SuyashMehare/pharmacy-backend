const productRouter = require('express').Router();

const { 
    getProducts,
    getProductById
} = require('../controllers/user.controller');

productRouter
.get('/', getProducts)
.get('/:productId', getProductById);

module.exports = productRouter;