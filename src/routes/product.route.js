const productRouter = require('express').Router();

const { getProducts 
} = require('../controllers/user.controller');

productRouter
.get('/', getProducts)

module.exports = productRouter;