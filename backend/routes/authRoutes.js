const express = require('express');
const multer = require('multer');
const path = require('path');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Multer config — store uploaded docs in /uploads/docs/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/docs'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.post('/register', upload.single('document'), register);
router.post('/login', login);

module.exports = router;
