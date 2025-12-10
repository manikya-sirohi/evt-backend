const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}`
        });
      }
    }

    const order = await Order.create({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      })),
      totalAmount: cart.totalPrice,
      shippingAddress: req.body.shippingAddress || 'Default Address',
      paymentMethod: req.body.paymentMethod || 'COD'
    });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = orderStatus;
    
    if (orderStatus === 'delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product');

    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalAmount,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
