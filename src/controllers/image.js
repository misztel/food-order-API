const Image = require('../models/image');

exports.addImage = (req, res, next) => {
  console.log('body: ', req.body, 'file: ', req.file);
  const image = new Image({
    name: req.file.filename,
    data: req.file.path
  });

  image.save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: 'Image added',
        image
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getImages = (req, res, next) => {
  Image.find()
    .then((images) => {
      res.status(200).json({
        message: 'Images fetched successfully',
        images
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteImage = (req, res, next) => {
  console.log('IDDDDD: ', req.params);
  const imageId = req.params.id;

  Image.findById(imageId)
    .then((image) => {
      if (!image) {
        const error = new Error('Could not find image');
        error.statusCode = 404;
        throw error;
      }
      return Image.findByIdAndRemove(imageId);
    })
    .then((result) => {
      res.status(200).json({
        id: result._id,
        message: 'Image deleted successfully'
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
