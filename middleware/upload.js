const multer = require('multer');
const path = require('path');
// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },

});

const fileFilter= (req,file,cb )=> {
  const fileExt= path.extname((file.originalname).toLowerCase());
  console.log(fileExt)
  if (fileExt !== '.pdf' && fileExt !== '.jpg' && fileExt !== '.png' && fileExt !== '.jpeg') {
    cb(new Error('Only .pdf, .jpg, .png, and .jpeg files are allowed'));
  } else {
    cb(null, true);
  }
}
// Create the multer instance
const upload = multer({ storage: storage,fileFilter:fileFilter });

module.exports = upload;