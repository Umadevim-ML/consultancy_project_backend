
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Consultation = require('../models/Consultation');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalShipped = await Order.countDocuments({ isShipped: true });
        const totalDelivered = await Order.countDocuments({ isDelivered: true });
        const totalUsers = await User.countDocuments({ isAdmin: false });
        const totalProducts = await Product.countDocuments();
        const totalConsultations = await Consultation.countDocuments();

        const salesData = await Order.aggregate([
            { $match: { isDelivered: true } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalPrice' }
                }
            }
        ]);

        const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

        // Monthly sales for current year based on delivery date
        const currentYear = new Date().getFullYear();
        const monthlySales = await Order.aggregate([
            {
                $match: {
                    isDelivered: true,
                    deliveredAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$deliveredAt' },
                    total: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Map months to readable names or just indices
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const formattedMonthlySales = monthNames.map((month, index) => {
            const foundMonth = monthlySales.find(item => item._id === index + 1);
            return {
                month: month,
                total: foundMonth ? foundMonth.total : 0
            };
        });

        res.json({
            totalOrders,
            totalShipped,
            totalDelivered,
            totalUsers,
            totalProducts,
            totalConsultations,
            totalSales,
            monthlySales: formattedMonthlySales
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

module.exports = {
    getAdminStats
};
