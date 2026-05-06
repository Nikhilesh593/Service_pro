const express = require('express');
const { createRequest, getMyRequests, getAllRequests, acceptRequest, completeRequest, downloadPdf } = require('../controllers/requestController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorize('customer'), createRequest);
router.get('/my', authorize('customer', 'technician', 'organization'), getMyRequests);
router.get('/all', authorize('technician', 'organization', 'admin'), getAllRequests);
router.put('/accept/:id', authorize('technician', 'organization'), acceptRequest);
router.put('/complete/:id', authorize('technician', 'organization', 'admin'), completeRequest);
router.get('/:id/pdf', downloadPdf);

module.exports = router;
