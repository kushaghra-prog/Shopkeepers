const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateSignup, validateLogin, runValidation } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.jpg','.jpeg','.png','.webp'].includes(ext)) cb(null, true);
  else cb(new Error('Only images allowed'), false);
}});

router.post('/signup', authLimiter, validateSignup, runValidation, signup);
router.post('/login', authLimiter, validateLogin, runValidation, login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('restaurantImage'), updateProfile);
router.put('/change-password', auth, changePassword);

module.exports = router;
