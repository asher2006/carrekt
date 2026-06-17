const express = require('express');
const router = express.Router();
const { getCars, getCarByModel, getBrands } = require('../controllers/carController');

router.get('/', getCars);
router.get('/brands', getBrands);
router.get('/:model', getCarByModel);

module.exports = router;
