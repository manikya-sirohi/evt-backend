const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All order routes are protected
router.use(protect);

router.route('/')
  .post(createOrder)
  .get(getMyOrders);

router.get('/admin/all', authorize('admin'), getAllOrders);

router.get('/:id', getOrder);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;
