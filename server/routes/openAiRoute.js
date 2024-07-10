const express = require('express');
const { dalle3 } = require('../controllers/openAiController');
const router = express.Router();

router.post('/', dalle3);

module.exports = router;
