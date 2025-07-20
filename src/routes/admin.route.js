const { authenticate, authorizeAdmin, authorizeRegular, authorizeRoles} = require('../middlewares/auth/auth.middleware')

const adminRouter = require('express').Router()
const { getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    createManyProducts,
    updateOrderStatus
} = require('../controllers/admin.controller');


adminRouter.use(authenticate);
adminRouter.use(authorizeAdmin);

adminRouter
.get('/', getProducts)
.post('/', createProduct)
.post('/many', createManyProducts)
.patch('/:id', updateProduct)
.delete('/:id',deleteProduct)


adminRouter
.patch('/order/status', updateOrderStatus)

module.exports = adminRouter