const chalk = require('chalk');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const setupDB = require('./db');
const { ROLES, MERCHANT_STATUS } = require('../constants');
const User = require('../models/user');
const Merchant = require('../models/merchant');

const args = process.argv.slice(2);
const email = args[0] || 'merchant@example.com';
const password = args[1] || 'merchant123';

const createMerchant = async () => {
  try {
    console.log(`${chalk.blue('✓')} ${chalk.blue('Creating merchant user and merchant...')}`);

    // 1. Create merchant user
    let merchantUser = await User.findOne({ email });
    if (!merchantUser) {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Creating merchant user...')}`);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      
      merchantUser = new User({
        email,
        password: hash,
        firstName: 'Test',
        lastName: 'Merchant',
        role: ROLES.Merchant
      });
      await merchantUser.save();
      console.log(`${chalk.green('✓')} ${chalk.green('Merchant user created successfully.')}`);
    } else {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Merchant user already exists.')}`);
    }

    // 2. Create merchant record
    let merchant = await Merchant.findOne({ email });
    if (!merchant) {
      merchant = new Merchant({
        name: 'Test Merchant Store',
        email: email,
        phoneNumber: '+1234567890',
        brandName: 'Test Brand',
        business: 'Online Retail',
        isActive: false,
        status: MERCHANT_STATUS.Waiting_Approval
      });
      await merchant.save();
      console.log(`${chalk.green('✓')} ${chalk.green('Merchant record created successfully.')}`);
    } else {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Merchant record already exists.')}`);
    }

    // 3. Link user to merchant
    if (!merchantUser.merchant) {
      merchantUser.merchant = merchant._id;
      await merchantUser.save();
      console.log(`${chalk.green('✓')} ${chalk.green('User linked to merchant.')}`);
    }

    console.log(`${chalk.blue('✓')} ${chalk.blue('Merchant creation completed!')}`);
    console.log(`${chalk.cyan('ℹ')} ${chalk.cyan('Merchant credentials:')}`);
    console.log(`${chalk.cyan('ℹ')} ${chalk.cyan(`Email: ${email}`)}`);
    console.log(`${chalk.cyan('ℹ')} ${chalk.cyan(`Password: ${password}`)}`);
    console.log(`${chalk.cyan('ℹ')} ${chalk.cyan(`Status: ${merchant.status}`)}`);
    console.log(`${chalk.cyan('ℹ')} ${chalk.cyan('Note: Merchant can now create a brand, but it needs admin approval.')}`);

  } catch (error) {
    console.log(`${chalk.red('✗')} ${chalk.red('Error creating merchant:')}`);
    console.log(error);
  } finally {
    await mongoose.connection.close();
    console.log(`${chalk.blue('✓')} ${chalk.blue('Database connection closed!')}`);
  }
};

(async () => {
  try {
    await setupDB();
    await createMerchant();
  } catch (error) {
    console.error(`Error initializing database: ${error.message}`);
  }
})();
