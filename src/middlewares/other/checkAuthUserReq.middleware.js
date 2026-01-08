const { decode } = require("jsonwebtoken");
const BaseUser = require("../../models/users/baseUser.model");

async function checkAuthUserReq(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if(!authHeader) {
            req.isAuthUserReq = false;
            next();
            return;
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = decode(token)
        const user = await BaseUser.findById(decoded.id);

        if(!user) {
            req.isAuthUserReq = false;
            next();
            return;
        }

        req.userId = user._id;
        req.isAuthUserReq = true;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        req.isAuthUserReq = false;
        next(error);
    }
}

module.exports = {
    checkAuthUserReq
}