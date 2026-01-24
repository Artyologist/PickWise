const router = require('express').Router();
const { getUniverse } = require('../controllers/universe');

router.get('/:slug', getUniverse);

module.exports = router;
