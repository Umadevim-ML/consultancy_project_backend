
const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        let keyword = {};
        if (req.query.keyword && req.query.keyword.trim() !== '') {
            const escaped = req.query.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            keyword = {
                name: {
                    $regex: escaped,
                    $options: 'i',
                },
            };
        }

        const products = await Product.find({ ...keyword });
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Error deleting product' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            image,
            brand,
            category,
            description,
            firmness,
            size,
            features,
            countInStock,
            discount,
        } = req.body;

        const product = new Product({
            name: name || 'Sample Name',
            price: price || 0,
            user: req.user._id,
            image: image || 'https://placehold.co/600x400?text=New+Product',
            brand: brand || 'Sample Brand',
            category: category || 'General',
            countInStock: countInStock || 0,
            numReviews: 0,
            description: description || 'Sample description',
            firmness: firmness || 'Medium',
            size: size || 'Queen',
            features: features || [],
            discount: discount || 0,
            isActive: true,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            description,
            image,
            brand,
            category,
            countInStock,
            firmness,
            size,
            features,
            discount,
            isActive,
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name !== undefined ? name : product.name;
            product.price = price !== undefined ? price : product.price;
            product.description = description !== undefined ? description : product.description;
            product.image = image !== undefined ? image : product.image;
            product.brand = brand !== undefined ? brand : product.brand;
            product.category = category !== undefined ? category : product.category;
            product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
            product.firmness = firmness !== undefined ? firmness : product.firmness;
            product.size = size !== undefined ? size : product.size;
            product.features = features !== undefined ? features : product.features;
            product.discount = discount !== undefined ? discount : product.discount;
            product.isActive = isActive !== undefined ? isActive : product.isActive;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
const updateStock = async (req, res) => {
    try {
        const { countInStock } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.countInStock = countInStock;
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ message: 'Error updating stock' });
    }
};

// @desc    Update product discount
// @route   PATCH /api/products/:id/discount
// @access  Private/Admin
const updateDiscount = async (req, res) => {
    try {
        const { discount } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.discount = discount;
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Update discount error:', error);
        res.status(500).json({ message: 'Error updating discount' });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                res.status(400).json({ message: 'Product already reviewed' });
                return;
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            product.reviews.push(review);

            product.numReviews = product.reviews.length;

            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Error creating review' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    updateStock,
    updateDiscount,
    createProductReview,
};
