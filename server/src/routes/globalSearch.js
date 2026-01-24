const express = require('express');
const { globalSearchController } = require('../controllers/globalSearch');

const router = express.Router();

router.get('/', globalSearchController);

module.exports = router;
