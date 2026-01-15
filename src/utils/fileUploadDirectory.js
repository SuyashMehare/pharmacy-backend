const path = require('path');

const uploadDir = path.resolve(
    process.cwd(),
    process.env.UPLOAD_DIR || 'uploads'
);

module.exports = {
    uploadDir
}