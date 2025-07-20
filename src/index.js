require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./configs/db.confing');
const logger = require('./utils/logger');
const errorHandler = require("./middlewares/other/errorHandler.middleware");

// Import route files
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const adminRoutes = require('./routes/admin.route');
const productRoutes = require('./routes/product.route');
const ApiError = require('./utils/ApiError');
const orderStatusRouter = require('./routes/orderStatuses.route');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Database connection
connectDB()
  .then(() => {
    logger.info('Database connection established');
  })
  .catch((err) => {
    logger.error('Database connection failed', err);
  });


  
  
  // Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/transaction', orderStatusRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 - Keep this as the last route
app.use((req, res, next) => {
  next(new ApiError(404, "Route Not Found (app)"));
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = server; // For testing purposes