const userRouter = require('express').Router();

const { getProducts, createOrder, getOrderHistory, abortOrder, subscribeProductPrice, unsubscribeFromProduct 
} = require('../controllers/user.controller');
const { authorizeRegular, authenticate } = require('../middlewares/auth/auth.middleware');
const { sendResponse } = require('../utils/ApiResponse');


userRouter
.get('/', getProducts)

userRouter.use(authenticate)
userRouter.use(authorizeRegular)
userRouter
.post('/product/subscribe', subscribeProductPrice)
.post('/product/unsubscribe', unsubscribeFromProduct)

userRouter
.get('/order/history', getOrderHistory)
.post('/order', createOrder)
.patch('/order/abort', abortOrder)

module.exports = userRouter;





// .get('/todoFilter', async(req, res) => {
//     const {price, brand} = req.query;
     
//     const query = {
//         ...(brand && { brand }),
//         ...(price && { $lte: JSON.parse(price)?.lte, $gte: JSON.parse(price)?.gte })
//     }

//     sendResponse(res, 200, [], 'afadfasdf')
// })