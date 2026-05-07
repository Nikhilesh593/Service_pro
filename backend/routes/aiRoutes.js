const express = require('express');
const { suggestService, chatWithAI } = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, authorize('customer'));
router.post('/suggest-service', suggestService);
router.post('/chat', chatWithAI);

module.exports = router;
