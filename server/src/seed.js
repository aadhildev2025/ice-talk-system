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

const defaultCategories = [
  { name: 'All', icon: 'LayoutGrid', sortOrder: 0 },
  { name: 'Rice', icon: 'Utensils', sortOrder: 1 },
  { name: 'Kottu', icon: 'Flame', sortOrder: 2 },
  { name: 'Buns', icon: 'Sandwich', sortOrder: 3 },
  { name: 'Short Eats', icon: 'Cookie', sortOrder: 4 },
  { name: 'Burgers', icon: 'Beef', sortOrder: 5 },
  { name: 'Juice', icon: 'GlassWater', sortOrder: 6 },
  { name: 'Milkshakes', icon: 'CupSoda', sortOrder: 7 },
  { name: 'Falooda', icon: 'Cherry', sortOrder: 8 },
  { name: 'Ice Cream', icon: 'IceCream', sortOrder: 9 },
  { name: 'Desserts', icon: 'Sparkles', sortOrder: 10 },
  { name: 'Other', icon: 'Layers', sortOrder: 11 },
];

const defaultMenuItems = [
  {
    name: 'Chicken Kottu',
    description: 'Authentic Sri Lankan shredded roti, juicy spiced chicken, eggs and fresh vegetables.',
    price: 850,
    category: 'Kottu',
    department: 'KITCHEN',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 12,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cheese Chicken Kottu',
    description: 'Rich creamy cheese melted over spicy chicken kottu and crispy roti.',
    price: 1150,
    category: 'Kottu',
    department: 'KITCHEN',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 15,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Beef Kottu',
    description: 'Slow-cooked tender beef tossed with fragrant spices and crispy roti shreds.',
    price: 950,
    category: 'Kottu',
    department: 'KITCHEN',
    isAvailable: true,
    isPopular: false,
    prepTimeMinutes: 12,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Egg Kottu',
    description: 'Classic egg & vegetable kottu with house curry sauce.',
    price: 650,
    category: 'Kottu',
    department: 'KITCHEN',
    isAvailable: true,
    isPopular: false,
    prepTimeMinutes: 10,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Special Mixed Fried Rice',
    description: 'Basmati rice wok-tossed with chicken, prawns, egg, and fresh spring onions.',
    price: 1100,
    category: 'Rice',
    department: 'KITCHEN',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 15,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Chicken Fried Rice',
    description: 'Fragrant seasoned fried rice with tender chicken slices and house chili paste.',
    price: 900,
    category: 'Rice',
    department: 'KITCHEN',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 12,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Seafood Nasi Goreng',
    description: 'Indonesian style spicy fried rice with squid, prawns, sunny side egg, and prawn crackers.',
    price: 1350,
    category: 'Rice',
    department: 'KITCHEN',
    isAvailable: true,
    isPopular: false,
    prepTimeMinutes: 18,
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Crispy Chicken Burger',
    description: 'Golden crumbed chicken patty with melted cheddar, garlic mayo, and crisp lettuce.',
    price: 750,
    category: 'Burgers',
    department: 'KITCHEN',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 10,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Chicken Bun',
    description: 'Soft baked golden bakery bun filled with spicy minced chicken stuffing.',
    price: 450,
    category: 'Buns',
    department: 'BUN',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 3,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fish Bun',
    description: 'Traditional Sri Lankan roasted fish bun packed with spiced mackerel and potato.',
    price: 350,
    category: 'Buns',
    department: 'BUN',
    isAvailable: true,
    isPopular: false,
    prepTimeMinutes: 3,
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Chicken Roll',
    description: 'Crumbed and fried savory roll with spicy shredded chicken and potato filling.',
    price: 180,
    category: 'Short Eats',
    department: 'BUN',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 2,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Vegetable Samosa (3 pcs)',
    description: 'Crispy pastry parcels stuffed with spiced curried vegetables.',
    price: 250,
    category: 'Short Eats',
    department: 'BUN',
    isAvailable: true,
    isPopular: false,
    prepTimeMinutes: 3,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Mango Juice',
    description: 'Fresh blended tropical sweet mango with ice and mint garnish.',
    price: 450,
    category: 'Juice',
    department: 'JUICE',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 4,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fresh Orange Juice',
    description: '100% freshly squeezed Valencia oranges served chilled.',
    price: 500,
    category: 'Juice',
    department: 'JUICE',
    isAvailable: true,
    isPopular: false,
    prepTimeMinutes: 4,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Lime Juice with Mint',
    description: 'Zesty refreshing lime juice with fresh crushed garden mint leaves.',
    price: 350,
    category: 'Juice',
    department: 'JUICE',
    isAvailable: true,
    isPopular: false,
    prepTimeMinutes: 3,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Avocado Shake',
    description: 'Creamy buttery avocado blended with full cream milk and natural bee honey.',
    price: 600,
    category: 'Milkshakes',
    department: 'JUICE',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 5,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Chocolate Milkshake',
    description: 'Decadent chocolate gelato shake topped with whipped cream and cocoa drizzle.',
    price: 550,
    category: 'Milkshakes',
    department: 'JUICE',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 5,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Royal Ice Talk Falooda',
    description: 'Signature layered dessert drink with rose syrup, basil seeds, jelly, vermicelli and vanilla ice cream.',
    price: 650,
    category: 'Falooda',
    department: 'JUICE',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 6,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Special Sundae Ice Cream',
    description: 'Trio of vanilla, strawberry, and chocolate ice cream with crushed nuts and wafer.',
    price: 550,
    category: 'Ice Cream',
    department: 'OTHER',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 3,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Chocolate Brownie with Ice Cream',
    description: 'Warm fudge chocolate brownie served with a scoop of Madagascar vanilla ice cream.',
    price: 650,
    category: 'Desserts',
    department: 'OTHER',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 4,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Mineral Water (1.5L)',
    description: 'Chilled bottled pure drinking water.',
    price: 150,
    category: 'Other',
    department: 'OTHER',
    isAvailable: true,
    isPopular: false,
    prepTimeMinutes: 1,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
  },
];

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
    name: 'Manager Admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    department: 'ALL',
    phone: '+94 77 123 4567',
  },
  {
    name: 'Ahmed',
    username: 'ahmed',
    password: 'waiter123',
    role: 'waiter',
    department: 'ALL',
    phone: '+94 77 234 5678',
  },
  {
    name: 'Fatima',
    username: 'fatima',
    password: 'waiter123',
    role: 'waiter',
    department: 'ALL',
    phone: '+94 77 345 6789',
  },
  {
    name: 'Kitchen Chef Kamal',
    username: 'kitchen',
    password: 'kitchen123',
    role: 'kitchen',
    department: 'KITCHEN',
  },
  {
    name: 'Juice Master Riyaz',
    username: 'juice',
    password: 'juice123',
    role: 'juice',
    department: 'JUICE',
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
      console.log('[AutoSeed] Default users created (admin/admin123, ahmed/waiter123, kitchen/kitchen123, juice/juice123).');
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
