const userRouter = require('express').Router();

const { getProducts, createOrder, getOrderHistory, abortOrder 
} = require('../controllers/user.controller');
const { authorizeRegular, authenticate } = require('../middlewares/auth/auth.middleware');
const { sendResponse } = require('../utils/ApiResponse');

userRouter.use(authenticate)
userRouter.use(authorizeRegular)

userRouter
.get('/', getProducts)

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