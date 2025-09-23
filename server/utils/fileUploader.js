const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'civic-connect',
        format: async (req, file) => {
            // Keep original format for videos, convert images to jpeg
            if (file.mimetype.startsWith('video/')) {
                return file.mimetype.split('/')[1]; // Extract format (mp4, mov, etc.)
            }
            return 'jpeg';
        },
        public_id: (req, file) => {
            const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
            return `${type}-report-${Date.now()}`;
        },
        resource_type: async (req, file) => {
            // Set resource type based on file type
            if (file.mimetype.startsWith('video/')) {
                return 'video';
            }
            return 'image';
        }
    },
});

const upload = multer({ storage: storage });

module.exports = upload;