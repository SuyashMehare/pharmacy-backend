const authRouter = require('express').Router();

const { signup, login, forgotPassword, resetPassword } = require('../controllers/auth.controller');

authRouter
.post('/signup', signup)
.post('/login', login)
.post('/forgot-password', forgotPassword)
.post('/reset-password', resetPassword)


module.exports = authRouter;