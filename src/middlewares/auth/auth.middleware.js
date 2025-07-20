const { verifyToken } = require('../../utils/jwt');
const BaseUser = require('../../models/users/baseUser.model');
const { decode } = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = decode(token);
    if (!decoded || !decoded.role) {
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    const verified = verifyToken(token, decoded.role);
    
    const user = await BaseUser.findById(verified.id);
    if (!user || user.isDeleted) { /// 
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {   
    console.log(error);
    
    return res.status(401).json({ error: error.message || 'Authentication failed' });
  }
};

// Role-specific middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Role ${req.user.role} is not authorized to access this resource` 
      });
    }
    next();
  };
};

// Convenience middleware for common roles
const authorizeRegular = authorizeRoles('regular');
const authorizeAdmin = authorizeRoles('admin');

module.exports = {
  authenticate,
  authorizeRoles,
  authorizeRegular,
  authorizeAdmin
};