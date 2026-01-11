const userRouter = require('express').Router();

const { getProducts, createOrder, getOrderHistory, abortOrder, subscribeProductPrice, unsubscribeFromProduct, getUserNotifications, getProductById 
} = require('../controllers/user.controller');
const { authorizeRegular, authenticate } = require('../middlewares/auth/auth.middleware');
const { checkAuthUserReq } = require('../middlewares/other/checkAuthUserReq.middleware');
const { sendResponse } = require('../utils/ApiResponse');


userRouter
.get('/', checkAuthUserReq, getProducts)
.get('/product/:productId', getProductById)

userRouter.use(authenticate)
userRouter.use(authorizeRegular)

userRouter
.get('/notifications', getUserNotifications)

userRouter
.post('/product/subscribe/:productId', subscribeProductPrice)
.post('/product/unsubscribe/:productId', unsubscribeFromProduct)

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