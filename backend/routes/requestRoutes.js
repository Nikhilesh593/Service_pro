const express = require('express');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
  downloadPdf,
  getAnalytics
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
router.get('/:id/pdf', downloadPdf);

module.exports = router;
