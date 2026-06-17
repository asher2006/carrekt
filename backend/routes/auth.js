const express = require('express');
const { getAuthUser, signIn, signUp } = require('../controllers/authController');

const router = express.Router();

router.get('/me', getAuthUser);
router.post('/signin', signIn);
router.post('/signup', signUp);

module.exports = router;
