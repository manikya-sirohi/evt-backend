const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user.id);

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const qty = quantity || 1;
    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    let cart = await Cart.getOrCreateCart(req.user.id);

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + qty;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Cannot add more items than available stock'
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    const product = await Product.findById(item.product);
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
