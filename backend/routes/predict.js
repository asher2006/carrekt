const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { predict } = require('../controllers/predictController');

router.post('/', upload.single('image'), predict);
router.post('/camera', upload.single('image'), predict);

module.exports = router;
