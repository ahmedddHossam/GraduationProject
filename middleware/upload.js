const multer = require('multer');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
  fileFilter: (req, file, cb)=> {
    console.log(path.extension(file.originalname))
    if (path.extension(file.originalname) !== '.pdf' || path.extension(file.originalname) !== '.jpg' || path.extension(file.originalname) !== '.png' || path.extension(file.originalname) !== '.jpeg' ) {
      cb(null, false)
    }

    cb(null, true)
  }
});

// Create the multer instance
const upload = multer({ storage: storage, });

module.exports = upload;