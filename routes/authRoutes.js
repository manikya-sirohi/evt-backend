const express = require('express');
const router = express.Router();
const { register, login, getMe, becomeSeller } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/become-seller', protect, becomeSeller);

module.exports = router;
