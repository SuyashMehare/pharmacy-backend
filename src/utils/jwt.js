const jwt = require('jsonwebtoken');
const { 
    regularJwtSecret, 
    adminJwtSecret, 
    jwtExpiration, 
    jwtIssuer, 
    adminResetJwtSecret,
    regularUserResetJwtSecret
} = require('../configs/auth.config');

function generateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  const secret = user.role === 'admin' ? adminJwtSecret : regularJwtSecret;
  
  return jwt.sign(payload, secret, {
    expiresIn: jwtExpiration,
    issuer: jwtIssuer
  });
};

function verifyToken (token, role) {
  const secret = role === 'admin' ? adminJwtSecret : regularJwtSecret;
  
  try {
    return jwt.verify(token, secret, { issuer: jwtIssuer });
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

function generateResetToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
  };

  const secret = user.role === 'admin' ? adminResetJwtSecret : regularUserResetJwtSecret;
  return jwt.sign(payload, secret, {
    expiresIn: jwtExpiration,
    issuer: jwtIssuer
  });
}

function verifyResetToken(token, role) {
  const secret = role === 'admin' ? adminResetJwtSecret : regularUserResetJwtSecret;
  
  try {
    return jwt.verify(token, secret, { issuer: jwtIssuer });
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

function decodeJwt(token) {
  return jwt.decode(token)
}
module.exports = { generateToken, verifyToken, generateResetToken, decodeJwt, verifyResetToken };