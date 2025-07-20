const { 
    updateTxSuccessAndOrderInititated 
} = require('../controllers/orderStatuses.controller');

const orderStatusRouter = require('express').Router();



orderStatusRouter
.patch('/success/status/initiate', updateTxSuccessAndOrderInititated)

module.exports = orderStatusRouter;