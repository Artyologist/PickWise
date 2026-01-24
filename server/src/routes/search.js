const express = require('express');
const router = express.Router();
const {
  homeSearchController,
  searchController
} = require('../controllers/search');

router.post('/home', homeSearchController);
router.post('/', searchController);

module.exports = router;
