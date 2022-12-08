const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const imageController = require('../controllers/image');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const isSuperAdmin = require('../middleware/is-superAdmin');

const router = express.Router();

// Image upload
const fileStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'src/upload');
  },
  filename(req, file, cb) {
    cb(null, uuidv4() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter
});

router.post('/image', upload.single('imageData'), imageController.addImage);

router.get('/images', imageController.getImages);

router.delete('/image/:id', isAuth, isAdmin, imageController.deleteImage);

module.exports = router;
