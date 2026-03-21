
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createNotification, notifyAdmins } = require('../utils/notification');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        console.log('Incoming Order Data:', req.body);
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            mobileNumber,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        }

        // 1. Validate stock for all items first
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                res.status(404).json({ message: `Product not found: ${item.name}` });
                return;
            }
            if (product.countInStock < item.qty) {
                res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
                return;
            }
        }

        // 2. Create the order
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            mobileNumber,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();

        // 3. Decrement stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { countInStock: -item.qty }
            });
        }

        console.log('Order created successfully:', createdOrder._id);

        // Notify User
        await createNotification(
            req.user._id,
            'Order Placed',
            `Your order #${createdOrder._id} has been placed successfully.`,
            'Order',
            `/order/${createdOrder._id}`
        );

        // Notify Admins
        await notifyAdmins(
            'New Order Received',
            `A new order #${createdOrder._id} has been placed by ${req.user.name}.`,
            'Order',
            `/admin/order/${createdOrder._id}`
        );

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Create order error details:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.product');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Error fetching order' });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Update order to paid error:', error);
        res.status(500).json({ message: 'Error updating payment' });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            const updatedOrder = await order.save();

            // Notify User
            await createNotification(
                order.user,
                'Order Delivered',
                `Your order #${order._id} has been delivered.`,
                'Order',
                `/order/${order._id}`
            );

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Update order to delivered error:', error);
        res.status(500).json({ message: 'Error updating delivery status' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

// @desc    Update order to shipped
// @route   PUT /api/orders/:id/ship
// @access  Private/Admin
const updateOrderToShipped = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isShipped = true;
            order.shippedAt = Date.now();

            const updatedOrder = await order.save();

            // Notify User
            await createNotification(
                order.user,
                'Order Shipped',
                `Your order #${order._id} has been shipped.`,
                'Order',
                `/order/${order._id}`
            );

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Update order to shipped error:', error);
        res.status(500).json({ message: 'Error updating shipping status' });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private/Admin
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.isCancelled) {
                res.status(400).json({ message: 'Order is already cancelled' });
                return;
            }

            order.isCancelled = true;
            order.cancelledAt = Date.now();

            const updatedOrder = await order.save();

            // Restore stock
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { countInStock: item.qty }
                });
            }

            // Notify User
            await createNotification(
                order.user,
                'Order Cancelled',
                `Your order #${order._id} has been cancelled.`,
                'Order',
                `/order/${order._id}`
            );

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Error cancelling order' });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'id name email')
            .populate('orderItems.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    updateOrderToShipped,
    cancelOrder,
    getMyOrders,
    getOrders,
};
