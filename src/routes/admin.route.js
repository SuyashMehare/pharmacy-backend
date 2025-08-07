const { authenticate, authorizeAdmin, authorizeRegular, authorizeRoles} = require('../middlewares/auth/auth.middleware')

const adminRouter = require('express').Router()
const { getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    createManyProducts,
    updateOrderStatus,
    updateProductPrice,
    getExecutableOrders
} = require('../controllers/admin.controller');


adminRouter.use(authenticate);
adminRouter.use(authorizeAdmin);

adminRouter
.get('/', getProducts)
.post('/', createProduct)
.post('/many', createManyProducts)
.patch('/:id', updateProduct)
.patch('/product/price/:productId', updateProductPrice)
.delete('/:id',deleteProduct)


adminRouter
.get('/orders', getExecutableOrders)
.patch('/order/status', updateOrderStatus)

module.exports = adminRouter