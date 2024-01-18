import multer from 'multer'

const imageFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const productImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './public/uploads/products')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  },
})

const getProductImages = multer({
  dest: 'public/uploads/products/',
  fileFilter: imageFilter,
  storage: productImageStorage
});

export { getProductImages };