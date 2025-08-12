const chalk = require('chalk');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const setupDB = require('./db');
const { ROLES } = require('../constants');
const User = require('../models/user');
const Brand = require('../models/brand');
const Category = require('../models/category');
const Product = require('../models/product');
const ProductSize = require('../models/productSize');
const Cart = require('../models/cart');
const Address = require('../models/address');
const Order = require('../models/order');
const Review = require('../models/review');
const Wishlist = require('../models/wishlist');
const Contact = require('../models/contact');
const Merchant = require('../models/merchant');

const args = process.argv.slice(2);
const email = args[0];
const password = args[1];

const seedDatabase = async () => {
  try {
    console.log(`${chalk.blue('✓')} ${chalk.blue('Seed database started')}`);

    if (!email || !password) throw new Error('Missing admin email and password arguments');
    
    // 1. Create admin user only
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Creating admin user...')}`);
      const user = new User({
        email,
        password,
        firstName: 'Admin',
        lastName: 'User',
        role: ROLES.Admin
      });

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
      await user.save();
      console.log(`${chalk.green('✓')} ${chalk.green('Admin user created successfully.')}`);
      console.log(`${chalk.blue('ℹ')} ${chalk.blue(`Email: ${email}`)}`);
      console.log(`${chalk.blue('ℹ')} ${chalk.blue(`Password: ${password}`)}`);
    } else {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Admin user already exists.')}`);
      console.log(`${chalk.blue('ℹ')} ${chalk.blue(`Existing Email: ${existingUser.email}`)}`);
    }

    // 2. Initialize all collections by creating their indexes
    // This ensures all collections exist even if empty
    console.log(`${chalk.blue('ℹ')} ${chalk.blue('Initializing database collections...')}`);
    
    // Force collection creation by ensuring indexes exist
    const collectionsToInit = [
      { model: Brand, name: 'brands' },
      { model: Category, name: 'categories' },
      { model: Product, name: 'products' },
      { model: ProductSize, name: 'productsizes' },
      { model: Cart, name: 'carts' },
      { model: Address, name: 'addresses' },
      { model: Order, name: 'orders' },
      { model: Review, name: 'reviews' },
      { model: Wishlist, name: 'wishlists' },
      { model: Contact, name: 'contacts' },
      { model: Merchant, name: 'merchants' }
    ];

    for (const { model, name } of collectionsToInit) {
      try {
        // Create indexes to ensure collection is created
        await model.collection.createIndex({ created: 1 });
        console.log(`${chalk.green('✓')} ${chalk.green(`Collection '${name}' initialized`)}`);
      } catch (error) {
        // If index already exists or other error, try alternative method
        try {
          await model.findOne({}).exec();
          console.log(`${chalk.green('✓')} ${chalk.green(`Collection '${name}' initialized`)}`);
        } catch (err) {
          console.log(`${chalk.yellow('!')} ${chalk.yellow(`Warning: Could not initialize '${name}' collection`)}`);
        }
      }
    }

    console.log(`${chalk.cyan('ℹ')} ${chalk.cyan('Database initialized successfully!')}`);
    console.log(`${chalk.cyan('ℹ')} ${chalk.cyan('All collections are ready for use.')}`);
    console.log(`${chalk.cyan('ℹ')} ${chalk.cyan('You can now create categories, brands, and products through the admin panel.')}`);
    
  } catch (error) {
    console.log(`${chalk.red('✗')} ${chalk.red('Error during database initialization:')}`);
    console.log(error);
    return null;
  } finally {
    await mongoose.connection.close();
    console.log(`${chalk.blue('✓')} ${chalk.blue('Database connection closed!')}`);
  }
};

(async () => {
  try {
    await setupDB();
    await seedDatabase();
  } catch (error) {
    console.error(`Error initializing database: ${error.message}`);
  }
})();
