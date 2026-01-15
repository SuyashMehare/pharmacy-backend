const fs = require('fs');
const multer  = require('multer');
const { authenticate, authorizeAdmin, authorizeRegular, authorizeRoles} = require('../middlewares/auth/auth.middleware')
const { uploadDir } = require('../utils/fileUploadDirectory')

fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

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
.post('/', upload.single('banner'), createProduct)
.post('/many', createManyProducts)
.patch('/:id', updateProduct)
.patch('/product/price/:productId', updateProductPrice)
.delete('/:id',deleteProduct)


adminRouter
.get('/orders', getExecutableOrders)
.patch('/order/status', updateOrderStatus)

module.exports = adminRouter