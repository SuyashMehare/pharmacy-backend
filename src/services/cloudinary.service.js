const { v2:cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


async function uploadImageToCloudinary(fileBuffer, options = {}) {
    if (!fileBuffer) {
        return {
            success: false,
            url: null,
            error: 'No file buffer provided'
        };
    }

    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: options.folder,
            resource_type: 'image'
        }, (err, res) => err ? reject(err) : resolve(res));

        stream.end(fileBuffer);
    })

    console.log("Clodinary result", result);
    
    return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id
    }
}


module.exports = {
    uploadImageToCloudinary
}