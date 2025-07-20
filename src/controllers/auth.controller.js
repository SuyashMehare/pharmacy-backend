const { generateToken, generateResetToken, verifyToken, decodeJwt, verifyResetToken } = require("../utils/jwt");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const BaseUser = require("../models/users/baseUser.model");
const AdminUser = require("../models/users/adminUser.model");
const RegularUser = require("../models/users/regularUser.model");

async function signup(req, res, next) {
    try {
        const { email, role='regular' } = req.body;
        const isUserExist = await BaseUser.exists({ email })

        if (isUserExist)
            throw new ApiError(401, 'User exist already.');

        if (role === 'admin')
            await AdminUser.create(req.body)

        if (role === 'regular')
            await RegularUser.create(req.body)

        sendResponse(res, 201, [], 'User signed up. Head to the login')
    } catch (error) {
        next(error)
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const baseUser = await BaseUser.findOne({ email })

        if (!baseUser)
            throw new ApiError(401, 'User not exist.');

        const passwordMatch = await baseUser.comparePassword(password)

        if (!passwordMatch)
            throw new ApiError(401, 'Invalid password.');

        const token = await generateToken(baseUser);

        sendResponse(res, 200, { token }, 'User logged in')
    } catch (error) {
        next(error)
    }
}

async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;

        const baseUser = await BaseUser.findOne({ email })

        if (!baseUser) // todo: dont let user know email exist or not
            throw new ApiError(401, 'User not exist.');

        const passwordMatch = await baseUser.comparePassword(password);

        if (!passwordMatch)
            throw new ApiError(401, 'Invalid password.');

        const token = await generateResetToken(baseUser);

        const resetLink = `http://localhost:3000/api/v1/auth/reset-password/${token}`
        sendResponse(res, 200, { url: resetLink }, 'Reset link generated')
    } catch (error) {
        next(error)
    }
}

async function resetPassword(req, res, next) {
    const { password } = req.body;
    const { token } = req.params;

    try {
        const decoded = decodeJwt(token)
    
        if (!decoded || !decoded.role)
            throw new ApiError(401, 'Invalid token structure');
    
        const verified = verifyResetToken(token, decoded.role);
    
        const user = await BaseUser.findById(verified.id);
    
        if (user.isDeleted)
            return res.status(401).json({ error: 'User no longer exists' });
    
        user.password = password;
        await user.save();
    
        sendResponse(res, 201, [], 'Password reset successfully.')
    } catch (error) {
        next(error)
    }
}

module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword
}