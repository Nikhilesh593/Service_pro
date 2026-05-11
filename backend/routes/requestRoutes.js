const express = require('express');
const {
	createRequest,
	getMyRequests,
	getAllRequests,
	acceptRequest,
	rejectRequest,
	completeRequest,
	downloadPdf,
	verifyQRCode,
	getAnalytics,
	verifyJobByLink,
	verifyJobByToken,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorize('customer'), upload.single('faultPhoto'), createRequest);
router.get('/my', authorize('customer', 'technician', 'organization'), getMyRequests);
router.get('/all', authorize('technician', 'organization', 'admin'), getAllRequests);
router.get('/analytics', authorize('technician', 'organization'), getAnalytics);
router.put('/accept/:id', authorize('technician', 'organization'), acceptRequest);
router.put('/reject/:id', authorize('technician', 'organization'), rejectRequest);
router.put('/complete/:id', authorize('technician', 'organization', 'admin'), completeRequest);
router.post('/:id/verify-qr', authorize('customer'), verifyQRCode);
router.post('/verify-token', verifyJobByToken); // No auth - single-use token only
router.get('/:id/pdf', downloadPdf);
router.get('/:id/verify-job', verifyJobByLink);
// Single-use verification link (no auth required)
router.get('/verify-link/:token', verifyJobByLink);

module.exports = router;
