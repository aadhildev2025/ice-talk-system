const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const connectDB = require('../config/db');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const { defaultCategories, defaultMenuItems } = require('../data/restaurantMenu');

const updateDatabaseMenu = async () => {
  try {
    console.log('[UpdateMenu] Connecting to MongoDB Atlas...');
    await connectDB();

    console.log('[UpdateMenu] Replacing Categories...');
    await Category.deleteMany({});
    const insertedCategories = await Category.insertMany(defaultCategories);
    console.log(`[UpdateMenu] Successfully inserted ${insertedCategories.length} categories.`);

    console.log('[UpdateMenu] Replacing Menu Items with new menu and portion pricing...');
    await MenuItem.deleteMany({});
    const insertedItems = await MenuItem.insertMany(defaultMenuItems);
    console.log(`[UpdateMenu] Successfully inserted ${insertedItems.length} menu items into MongoDB!`);

    const portionCount = insertedItems.filter((i) => i.hasPortions).length;
    console.log(`[UpdateMenu] Items with Portion/Full/Half options: ${portionCount}`);

    console.log('[UpdateMenu] Complete success!');
    process.exit(0);
  } catch (err) {
    console.error('[UpdateMenu] Error updating menu in MongoDB:', err);
    process.exit(1);
  }
};

updateDatabaseMenu();
