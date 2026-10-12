const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const User = require('./models/User');
const Table = require('./models/Table');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const PreparationTask = require('./models/PreparationTask');
const Sale = require('./models/Sale');

dotenv.config();

const { defaultCategories, defaultMenuItems } = require('./data/restaurantMenu');

const defaultTables = [
  { name: 'Family 01', capacity: 4, type: 'Family', sortOrder: 1 },
  { name: 'Family 02', capacity: 4, type: 'Family', sortOrder: 2 },
  { name: 'Family 03', capacity: 6, type: 'Family', sortOrder: 3 },
  { name: 'Family 04', capacity: 6, type: 'Family', sortOrder: 4 },
  { name: 'VIP 01', capacity: 8, type: 'VIP', sortOrder: 5 },
  { name: 'VIP 02', capacity: 8, type: 'VIP', sortOrder: 6 },
  { name: 'Couple 01', capacity: 2, type: 'Couple', sortOrder: 7 },
  { name: 'Couple 02', capacity: 2, type: 'Couple', sortOrder: 8 },
  { name: 'Outdoor A', capacity: 4, type: 'Outdoor', sortOrder: 9 },
  { name: 'Outdoor B', capacity: 4, type: 'Outdoor', sortOrder: 10 },
];

const defaultUsers = [
  {
    name: 'Super Admin (Owner)',
    username: 'superadmin',
    password: 'superadmin123',
    role: 'superadmin',
    department: 'ALL',
    phone: '+94 77 000 0001',
  },
  {
    name: 'Manager Admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    department: 'ALL',
    phone: '+94 77 123 4567',
  },
  {
    name: 'Waiter',
    username: 'waiter',
    password: 'waiter123',
    role: 'waiter',
    department: 'ALL',
    phone: '+94 77 234 5678',
  },
];

// Auto-seed function that runs safely on server startup if MongoDB is empty
const autoSeedIfNeeded = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[AutoSeed] No users found in MongoDB. Seeding default accounts...');
      for (const u of defaultUsers) {
        await User.create(u);
      }
      console.log('[AutoSeed] Default users created (admin/admin123, waiter/waiter123).');
    }

    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      console.log('[AutoSeed] No categories found in MongoDB. Seeding categories...');
      await Category.insertMany(defaultCategories);
      console.log('[AutoSeed] Categories seeded.');
    }

    const menuCount = await MenuItem.countDocuments();
    if (menuCount === 0) {
      console.log('[AutoSeed] No menu items found in MongoDB. Seeding full restaurant menu...');
      await MenuItem.insertMany(defaultMenuItems);
      console.log(`[AutoSeed] ${defaultMenuItems.length} Menu Items seeded into MongoDB successfully!`);
    }

    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      console.log('[AutoSeed] No tables found in MongoDB. Seeding default tables...');
      await Table.insertMany(defaultTables);
      console.log('[AutoSeed] Tables seeded.');
    }
  } catch (err) {
    console.error('[AutoSeed Error]:', err.message);
  }
};

// Complete reseed for CLI / Reset
const seedData = async (exitOnComplete = true) => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing collections...');

    await User.deleteMany({});
    await Table.deleteMany({});
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    await PreparationTask.deleteMany({});
    await Sale.deleteMany({});

    console.log('[Seed] Creating Users...');
    const admin = await User.create(defaultUsers[0]);
    for (let i = 1; i < defaultUsers.length; i++) {
      await User.create(defaultUsers[i]);
    }

    console.log('[Seed] Creating Tables...');
    const createdTables = await Table.insertMany(defaultTables);

    console.log('[Seed] Creating Categories...');
    await Category.insertMany(defaultCategories);

    console.log('[Seed] Creating Menu Items...');
    await MenuItem.insertMany(defaultMenuItems);

    console.log('[Seed] Creating Sample Completed Sales History...');
    const samplePastSales = [
      {
        saleNumber: 'INV-000101',
        tableId: createdTables[0]._id,
        tableNameSnapshot: 'Family 01',
        orderNumbers: [1001],
        items: [
          { name: 'Special Mixed Fried Rice', quantity: 2, price: 1100, total: 2200, department: 'KITCHEN' },
          { name: 'Mango Juice', quantity: 2, price: 450, total: 900, department: 'JUICE' },
          { name: 'Chicken Bun', quantity: 2, price: 450, total: 900, department: 'BUN' },
        ],
        subtotal: 4000,
        total: 4000,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        amountTendered: 4000,
        changeAmount: 0,
        cashierId: admin._id,
        cashierNameSnapshot: 'Manager Admin',
        createdAt: new Date(Date.now() - 3600 * 1000 * 3),
      },
      {
        saleNumber: 'INV-000102',
        tableId: createdTables[2]._id,
        tableNameSnapshot: 'Family 03',
        orderNumbers: [1002],
        items: [
          { name: 'Cheese Chicken Kottu', quantity: 2, price: 1150, total: 2300, department: 'KITCHEN' },
          { name: 'Royal Ice Talk Falooda', quantity: 2, price: 650, total: 1300, department: 'JUICE' },
          { name: 'Special Sundae Ice Cream', quantity: 2, price: 550, total: 1100, department: 'OTHER' },
        ],
        subtotal: 4700,
        total: 4700,
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
        amountTendered: 4700,
        changeAmount: 0,
        cashierId: admin._id,
        cashierNameSnapshot: 'Manager Admin',
        createdAt: new Date(Date.now() - 3600 * 1000 * 2),
      },
      {
        saleNumber: 'INV-000103',
        tableId: createdTables[6]._id,
        tableNameSnapshot: 'Couple 01',
        orderNumbers: [1003],
        items: [
          { name: 'Chicken Fried Rice', quantity: 2, price: 900, total: 1800, department: 'KITCHEN' },
          { name: 'Chocolate Milkshake', quantity: 2, price: 550, total: 1100, department: 'JUICE' },
        ],
        subtotal: 2900,
        total: 2900,
        paymentMethod: 'ONLINE',
        paymentStatus: 'PAID',
        amountTendered: 2900,
        changeAmount: 0,
        cashierId: admin._id,
        cashierNameSnapshot: 'Manager Admin',
        createdAt: new Date(Date.now() - 3600 * 1000 * 1),
      },
    ];

    await Sale.insertMany(samplePastSales);

    console.log('[Seed] Database seeded successfully in MongoDB!');
    if (exitOnComplete) {
      process.exit(0);
    }
    return { success: true };
  } catch (error) {
    console.error('[Seed Error]:', error);
    if (exitOnComplete) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = {
  seedData,
  autoSeedIfNeeded,
  defaultMenuItems,
  defaultCategories,
  defaultTables,
  defaultUsers,
};
