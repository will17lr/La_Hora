const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'la-hora/menu',
    resource_type: 'image',
    format: 'jpg', // ou laisser Cloudinary détecter
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  }),
});
module.exports = multer({ storage });
