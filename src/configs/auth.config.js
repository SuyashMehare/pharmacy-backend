module.exports = {
  regularJwtSecret: process.env.REGULAR_JWT_SECRET || 'regular_secret_key',
  adminJwtSecret: process.env.ADMIN_JWT_SECRET || 'admin_secret_key',
  regularUserResetJwtSecret: process.env.REGULAR_RESET_JWT_SECRET || 'regular_reset_secret_key',
  adminResetJwtSecret: process.env.ADMIN_RESET_JWT_SECRET || 'admin_reset_secret_key',
  jwtExpiration: '24h',
  jwtIssuer: 'pharmacy-backend'
};