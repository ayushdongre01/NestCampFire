// Import the Cloudinary library version 2 and configure it for use
const cloudinary = require('cloudinary').v2;

// Import Cloudinary storage module from multer-storage-cloudinary
const {cloudinaryStorage, CloudinaryStorage}=require('multer-storage-cloudinary');

// Configure Cloudinary with environment variables for authentication
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,   // Cloudinary account name
    api_key:process.env.CLOUDINARY_KEY, // API key for authentication
    api_secret:process.env.CLOUDINARY_SECRET    // API secret for secure access
});

// Set up storage using Cloudinary for file uploads
const storage=new CloudinaryStorage({
    cloudinary, // Cloudinary instance
    params:{
        folder:'NestCampFire',  // Folder in Cloudinary where files will be stored
        allowedFormats:['jpeg','png','jpg']  // Restrict uploads to specific formats
    }
});

// Export Cloudinary instance and storage configuration for use in other files
module.exports={
    cloudinary,
    storage
}
