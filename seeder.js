
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const users = require('./data/users');
const products = require('./data/products');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Questionnaire = require('./models/Questionnaire');
const Consultation = require('./models/Consultation');
const Recommendation = require('./models/Recommendation');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Questionnaire.deleteMany();
        await Consultation.deleteMany();
        await Recommendation.deleteMany();

        await Consultation.deleteMany();
        await Recommendation.deleteMany();

        // Use create instead of insertMany to trigger pre-save hooks (password hashing)
        const createdUsers = [];
        for (const user of users) {
            const createdUser = await User.create(user);
            createdUsers.push(createdUser);
        }

        const adminUser = createdUsers[0]._id;

        const sampleProducts = products.map((product) => {
            return { ...product, user: adminUser };
        });

        await Product.insertMany(sampleProducts);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Questionnaire.deleteMany();
        await Consultation.deleteMany();
        await Recommendation.deleteMany();

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
