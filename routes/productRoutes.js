const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
} = require('../controllers/productController');
const { protect, isSeller } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

router.get('/', getAllProducts);
router.get('/seller/my-products', protect, isSeller, getMyProducts);
router.get('/:id', getProduct);

router.post(
  '/',
  protect,
  isSeller,
  upload.single('image'),
  handleMulterError,
  createProduct
);

router.put(
  '/:id',
  protect,
  isSeller,
  upload.single('image'),
  handleMulterError,
  updateProduct
);

router.delete('/:id', protect, isSeller, deleteProduct);

module.exports = router;
