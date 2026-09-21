const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('./config/db');
const User = require('./models/User');
const Order = require('./models/Order');
const PreparationTask = require('./models/PreparationTask');
const Sale = require('./models/Sale');
const Table = require('./models/Table');
const MenuItem = require('./models/MenuItem');
const Notification = require('./models/Notification');

const cleanDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('\n--- 1. Clearing Orders, Preparation Tasks, Sales, and Notifications ---');
    const delOrders = await Order.deleteMany({});
    const delTasks = await PreparationTask.deleteMany({});
    const delSales = await Sale.deleteMany({});
    const delNotifications = await Notification.deleteMany({});
    console.log(`Deleted ${delOrders.deletedCount} orders.`);
    console.log(`Deleted ${delTasks.deletedCount} preparation tasks.`);
    console.log(`Deleted ${delSales.deletedCount} sales records.`);
    console.log(`Deleted ${delNotifications.deletedCount} notification records.`);

    console.log('\n--- 2. Resetting Tables to AVAILABLE ---');
    const updateTables = await Table.updateMany({}, { $set: { status: 'AVAILABLE' } });
    console.log(`Reset ${updateTables.modifiedCount} tables to AVAILABLE.`);

    console.log('\n--- 3. Removing Images from Menu Items ---');
    const updateMenu = await MenuItem.updateMany({}, { $set: { image: '' } });
    console.log(`Updated ${updateMenu.matchedCount} menu items to have no image.`);

    console.log('\n--- 4. Resetting Users to Super Admin, Admin, and Waiter ---');
    // Remove all users
    await User.deleteMany({});

    // Create Super Admin
    const superAdminUser = await User.create({
      name: 'Super Admin (Owner)',
      username: 'superadmin',
      password: 'superadmin123',
      role: 'superadmin',
      department: 'ALL',
      phone: '+94 77 000 0001',
    });
    console.log(`Created Super Admin user: ${superAdminUser.username} (${superAdminUser.role})`);

    // Create Admin
    const adminUser = await User.create({
      name: 'Manager Admin',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      department: 'ALL',
      phone: '+94 77 123 4567',
    });
    console.log(`Created Admin user: ${adminUser.username} (${adminUser.role})`);

    // Create Waiter
    const waiterUser = await User.create({
      name: 'Waiter',
      username: 'waiter',
      password: 'waiter123',
      role: 'waiter',
      department: 'ALL',
      phone: '+94 77 234 5678',
    });
    console.log(`Created Waiter user: ${waiterUser.username} (${waiterUser.role})`);

    const finalUsers = await User.find({}, 'username role name');
    console.log('\nFinal Users in Database:');
    console.table(finalUsers.map(u => ({ id: u._id.toString(), username: u.username, role: u.role, name: u.name })));

    console.log('\n Database cleaned and reset successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning database:', err);
    process.exit(1);
  }
};

cleanDatabase();
