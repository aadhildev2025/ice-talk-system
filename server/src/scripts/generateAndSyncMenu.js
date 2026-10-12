const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const connectDB = require('../config/db');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

const categoriesDef = [
  { name: 'All', icon: 'LayoutGrid', sortOrder: 0, department: 'KITCHEN' },
  { name: 'STARTER & SALADS', icon: 'Utensils', sortOrder: 1, department: 'KITCHEN' },
  { name: 'SHORT EATS', icon: 'Cookie', sortOrder: 2, department: 'BUN' },
  { name: 'SOUP', icon: 'Coffee', sortOrder: 3, department: 'KITCHEN' },
  { name: 'CURRY', icon: 'Bowl', sortOrder: 4, department: 'KITCHEN' },
  { name: 'FRIED RICE', icon: 'UtensilsCrossed', sortOrder: 5, department: 'KITCHEN' },
  { name: 'SPECIAL FRIED RICE', icon: 'Flame', sortOrder: 6, department: 'KITCHEN' },
  { name: 'GHEE FRIED RICE (PORTION ONLY)', icon: 'ChefHat', sortOrder: 7, department: 'KITCHEN' },
  { name: 'CHOPSUEY RICE (PORTION ONLY)', icon: 'Utensils', sortOrder: 8, department: 'KITCHEN' },
  { name: 'MONGOLIAN RICE', icon: 'Flame', sortOrder: 9, department: 'KITCHEN' },
  { name: 'NASI GORENG', icon: 'Sparkles', sortOrder: 10, department: 'KITCHEN' },
  { name: 'NOODLES', icon: 'Utensils', sortOrder: 11, department: 'KITCHEN' },
  { name: 'CHOPSUEY NOODLES (PORTION ONLY)', icon: 'Utensils', sortOrder: 12, department: 'KITCHEN' },
  { name: 'BIRIYANI (PORTION ONLY)', icon: 'ChefHat', sortOrder: 13, department: 'KITCHEN' },
  { name: 'SPECIAL PACKS & SAWANS', icon: 'Users', sortOrder: 14, department: 'KITCHEN' },
  { name: 'CHEESE KOTTU', icon: 'Flame', sortOrder: 15, department: 'KITCHEN' },
  { name: 'PALANDI KOTTU', icon: 'Flame', sortOrder: 16, department: 'KITCHEN' },
  { name: 'DOLPHIN KOTTU', icon: 'Flame', sortOrder: 17, department: 'KITCHEN' },
  { name: 'STRING HOPPER KOTTU', icon: 'Layers', sortOrder: 18, department: 'KITCHEN' },
  { name: 'KOTTU ROTTY', icon: 'Layers', sortOrder: 19, department: 'KITCHEN' },
  { name: 'HAWAIIAN KOTTU (PORTION ONLY)', icon: 'Flame', sortOrder: 20, department: 'KITCHEN' },
  { name: 'PEPPER KOTTU (PORTION ONLY)', icon: 'Flame', sortOrder: 21, department: 'KITCHEN' },
  { name: 'KURUMA', icon: 'Bowl', sortOrder: 22, department: 'KITCHEN' },
  { name: 'KADAI / WHITE KADAI', icon: 'Bowl', sortOrder: 23, department: 'KITCHEN' },
  { name: 'BUTTER MASALA', icon: 'Bowl', sortOrder: 24, department: 'KITCHEN' },
  { name: 'PARATA ROTTY', icon: 'Disc', sortOrder: 25, department: 'KITCHEN' },
  { name: 'NAAN ROTTY', icon: 'Disc', sortOrder: 26, department: 'KITCHEN' },
  { name: 'DEVILED (PORTION ONLY)', icon: 'Flame', sortOrder: 27, department: 'KITCHEN' },
  { name: 'BBQ & TANDOORI', icon: 'Flame', sortOrder: 28, department: 'KITCHEN' },
  { name: 'KEBAB & TIKKA', icon: 'Flame', sortOrder: 29, department: 'KITCHEN' },
  { name: 'SIDE DISHES', icon: 'Flame', sortOrder: 30, department: 'KITCHEN' },
  { name: 'PASTA', icon: 'Utensils', sortOrder: 31, department: 'KITCHEN' },
  { name: 'MEE GORENG', icon: 'Utensils', sortOrder: 32, department: 'KITCHEN' },
  { name: 'SUBMARINE', icon: 'Sandwich', sortOrder: 33, department: 'BUN' },
  { name: 'SHAWARMA', icon: 'Sandwich', sortOrder: 34, department: 'BUN' },
  { name: 'BURGER', icon: 'Beef', sortOrder: 35, department: 'BUN' },
  { name: 'SANDWICH', icon: 'Sandwich', sortOrder: 36, department: 'BUN' },
  { name: 'ICE CREAM', icon: 'IceCream', sortOrder: 37, department: 'JUICE' },
  { name: 'LESSI', icon: 'GlassWater', sortOrder: 38, department: 'JUICE' },
  { name: 'NUTS ICE CREAM', icon: 'IceCream', sortOrder: 39, department: 'JUICE' },
  { name: 'FRESH JUICE', icon: 'GlassWater', sortOrder: 40, department: 'JUICE' },
  { name: 'KULFI', icon: 'IceCream', sortOrder: 41, department: 'JUICE' },
  { name: 'MILKSHAKE', icon: 'CupSoda', sortOrder: 42, department: 'JUICE' },
  { name: 'KIDS ICE CREAM', icon: 'Sparkles', sortOrder: 43, department: 'JUICE' },
  { name: 'MOJITO', icon: 'GlassWater', sortOrder: 44, department: 'JUICE' },
  { name: 'COOL TREATS SPECIAL', icon: 'Cherry', sortOrder: 45, department: 'JUICE' },
  { name: 'SPECIAL MILK SHAKE', icon: 'CupSoda', sortOrder: 46, department: 'JUICE' },
  { name: 'BUBBLE TEA', icon: 'CupSoda', sortOrder: 47, department: 'JUICE' },
];

const menuItemsData = [
  // 1. STARTER & SALADS
  { name: 'French Fries', price: 750, category: 'STARTER & SALADS', department: 'KITCHEN' },
  { name: 'Fish Finger with French Fries', price: 1100, category: 'STARTER & SALADS', department: 'KITCHEN' },
  { name: 'Fruit & Vegetable Salad', price: 1100, category: 'STARTER & SALADS', department: 'KITCHEN' },
  { name: 'Chicken Salad', price: 850, category: 'STARTER & SALADS', department: 'KITCHEN' },
  { name: 'Vegetable Salad', price: 800, category: 'STARTER & SALADS', department: 'KITCHEN' },
  { name: 'Beef Salad', price: 1100, category: 'STARTER & SALADS', department: 'KITCHEN' },
  { name: 'Special Salad', price: 1300, category: 'STARTER & SALADS', department: 'KITCHEN' },

  // 2. SHORT EATS
  { name: 'Roll', price: 100, category: 'SHORT EATS', department: 'BUN' },
  { name: 'Mini Kives', price: 80, category: 'SHORT EATS', department: 'BUN' },
  { name: 'Drummer', price: 120, category: 'SHORT EATS', department: 'BUN' },
  { name: 'Nuggets', price: 350, category: 'SHORT EATS', department: 'BUN' },

  // 3. SOUP
  { name: 'Vegetable Soup', price: 400, category: 'SOUP', department: 'KITCHEN' },
  { name: 'Egg Soup', price: 450, category: 'SOUP', department: 'KITCHEN' },
  { name: 'Chicken Soup', price: 550, category: 'SOUP', department: 'KITCHEN' },
  { name: 'Beef Soup', price: 750, category: 'SOUP', department: 'KITCHEN' },
  { name: 'Sea Food Soup', price: 750, category: 'SOUP', department: 'KITCHEN' },
  { name: 'Sweet Corn Chicken Soup', price: 1100, category: 'SOUP', department: 'KITCHEN' },
  { name: 'Sweet Corn Sea Food Soup', price: 1100, category: 'SOUP', department: 'KITCHEN' },
  { name: 'Cream of Chicken Soup', price: 1050, category: 'SOUP', department: 'KITCHEN' },
  { name: 'Cream of Vegetable Soup', price: 900, category: 'SOUP', department: 'KITCHEN' },

  // 4. CURRY
  { name: 'Chicken Curry', price: 1400, category: 'CURRY', department: 'KITCHEN' },
  { name: 'Beef Curry', price: 1600, category: 'CURRY', department: 'KITCHEN' },
  { name: 'Mutton Curry', price: 2200, category: 'CURRY', department: 'KITCHEN' },

  // 5. FRIED RICE (Normal & Full)
  { name: 'Chicken Rice', category: 'FRIED RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 950, full: 1600, portion: 950 }, price: 950 },
  { name: 'Beef Rice', category: 'FRIED RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1000, full: 1700, portion: 1000 }, price: 1000 },
  { name: 'Prawn Rice', category: 'FRIED RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1000, full: 1700, portion: 1000 }, price: 1000 },
  { name: 'Cuttle Fish Rice', category: 'FRIED RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1000, full: 1700, portion: 1000 }, price: 1000 },
  { name: 'Fish Rice', category: 'FRIED RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1000, full: 1700, portion: 1000 }, price: 1000 },
  { name: 'Egg Rice', category: 'FRIED RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 800, full: 1400, portion: 800 }, price: 800 },
  { name: 'Vegetable Rice', category: 'FRIED RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 800, full: 1300, portion: 800 }, price: 800 },
  { name: 'Mix Rice', category: 'FRIED RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1100, full: 2000, portion: 1100 }, price: 1100 },
  { name: 'Special Rice (Seafood Only)', category: 'FRIED RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1300, full: 2400, portion: 1300 }, price: 1300 },

  // 6. SPECIAL FRIED RICE (Normal & Full)
  { name: 'Special Chicken Fried Rice', category: 'SPECIAL FRIED RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1450, full: 2200, portion: 1450 }, price: 1450 },
  { name: 'Special Beef Fried Rice', category: 'SPECIAL FRIED RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1500, full: 2300, portion: 1500 }, price: 1500 },
  { name: 'Special Mix Fried Rice', category: 'SPECIAL FRIED RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1550, full: 2400, portion: 1550 }, price: 1550 },

  // 7. GHEE FRIED RICE (PORTION ONLY)
  { name: 'Chicken (Portion)', category: 'GHEE FRIED RICE (PORTION ONLY)', department: 'KITCHEN', price: 1300, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1300 } },
  { name: 'Beef (Portion)', category: 'GHEE FRIED RICE (PORTION ONLY)', department: 'KITCHEN', price: 1400, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1400 } },
  { name: 'Sea Food (Portion)', category: 'GHEE FRIED RICE (PORTION ONLY)', department: 'KITCHEN', price: 1550, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1550 } },
  { name: 'Mix (Portion)', category: 'GHEE FRIED RICE (PORTION ONLY)', department: 'KITCHEN', price: 1550, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1550 } },

  // 8. CHOPSUEY RICE (PORTION ONLY)
  { name: 'Vegetable (Portion)', category: 'CHOPSUEY RICE (PORTION ONLY)', department: 'KITCHEN', price: 1050, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1050 } },
  { name: 'Chicken (Portion)', category: 'CHOPSUEY RICE (PORTION ONLY)', department: 'KITCHEN', price: 1450, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1450 } },
  { name: 'Sea Food (Portion)', category: 'CHOPSUEY RICE (PORTION ONLY)', department: 'KITCHEN', price: 1850, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1850 } },

  // 9. MONGOLIAN RICE (Normal & Full)
  { name: 'Chicken Mongolian Rice', category: 'MONGOLIAN RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1150, full: 2100, portion: 1150 }, price: 1150 },
  { name: 'Beef Mongolian Rice', category: 'MONGOLIAN RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1200, full: 2200, portion: 1200 }, price: 1200 },
  { name: 'Prawn Mongolian Rice', category: 'MONGOLIAN RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1200, full: 2200, portion: 1200 }, price: 1200 },
  { name: 'Sea Food Mongolian Rice', category: 'MONGOLIAN RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1300, full: 2300, portion: 1300 }, price: 1300 },
  { name: 'Mix Mongolian Rice', category: 'MONGOLIAN RICE', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1350, full: 2400, portion: 1350 }, price: 1350 },

  // 10. NASI GORENG (Normal & Full)
  { name: 'Chicken Nasi Goreng', category: 'NASI GORENG', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1150, full: 1950, portion: 1150 }, price: 1150 },
  { name: 'Beef Nasi Goreng', category: 'NASI GORENG', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1200, full: 2050, portion: 1200 }, price: 1200 },
  { name: 'Prawn Nasi Goreng', category: 'NASI GORENG', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1200, full: 2050, portion: 1200 }, price: 1200 },
  { name: 'Sea Food Nasi Goreng', category: 'NASI GORENG', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1250, full: 2200, portion: 1250 }, price: 1250 },
  { name: 'Mix Nasi Goreng', category: 'NASI GORENG', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1300, full: 2350, portion: 1300 }, price: 1300 },

  // 11. NOODLES (Normal & Full)
  { name: 'Chicken Noodles', category: 'NOODLES', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 750, full: 1250, portion: 750 }, price: 750 },
  { name: 'Beef Noodles', category: 'NOODLES', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 800, full: 1350, portion: 800 }, price: 800 },
  { name: 'Egg Noodles', category: 'NOODLES', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 700, full: 1200, portion: 700 }, price: 700 },
  { name: 'Vegetable Noodles', category: 'NOODLES', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 650, full: 1200, portion: 650 }, price: 650 },
  { name: 'Prawn Noodles', category: 'NOODLES', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 800, full: 1350, portion: 800 }, price: 800 },
  { name: 'Sea Food Noodles', category: 'NOODLES', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 900, full: 1400, portion: 900 }, price: 900 },
  { name: 'Mix Noodles', category: 'NOODLES', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 950, full: 1500, portion: 950 }, price: 950 },

  // 12. CHOPSUEY NOODLES (PORTION ONLY)
  { name: 'Vegetable (Portion)', category: 'CHOPSUEY NOODLES (PORTION ONLY)', department: 'KITCHEN', price: 1050, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1050 } },
  { name: 'Chicken (Portion)', category: 'CHOPSUEY NOODLES (PORTION ONLY)', department: 'KITCHEN', price: 1400, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1400 } },
  { name: 'Sea Food (Portion)', category: 'CHOPSUEY NOODLES (PORTION ONLY)', department: 'KITCHEN', price: 1800, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1800 } },

  // 13. BIRIYANI (PORTION ONLY)
  { name: 'Chicken (Portion)', category: 'BIRIYANI (PORTION ONLY)', department: 'KITCHEN', price: 1650, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1650 } },
  { name: 'Beef (Portion)', category: 'BIRIYANI (PORTION ONLY)', department: 'KITCHEN', price: 2000, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 2000 } },
  { name: 'Mutton (Portion)', category: 'BIRIYANI (PORTION ONLY)', department: 'KITCHEN', price: 2500, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 2500 } },
  { name: 'Prawn (Portion)', category: 'BIRIYANI (PORTION ONLY)', department: 'KITCHEN', price: 2000, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 2000 } },
  { name: 'Fish (Portion)', category: 'BIRIYANI (PORTION ONLY)', department: 'KITCHEN', price: 2000, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 2000 } },

  // 14. SPECIAL PACKS & SAWANS
  { name: 'Ice Talk Family Pack (Sea Food Only)', price: 6500, category: 'SPECIAL PACKS & SAWANS', department: 'KITCHEN' },
  { name: 'Ice Talk Sawal Special (Mix Only)', price: 7000, category: 'SPECIAL PACKS & SAWANS', department: 'KITCHEN' },
  { name: 'Biriyani Sawan (Chicken)', price: 8500, category: 'SPECIAL PACKS & SAWANS', department: 'KITCHEN' },
  { name: 'Biriyani Sawan (Beef)', price: 9500, category: 'SPECIAL PACKS & SAWANS', department: 'KITCHEN' },
  { name: 'Biriyani Sawan (Prawn)', price: 9500, category: 'SPECIAL PACKS & SAWANS', department: 'KITCHEN' },
  { name: 'Biriyani Sawan (Fish)', price: 8500, category: 'SPECIAL PACKS & SAWANS', department: 'KITCHEN' },
  { name: 'Nasi Goreng Sawan (Mix Only)', price: 6500, category: 'SPECIAL PACKS & SAWANS', department: 'KITCHEN' },
  { name: 'Mongolian Sawan (Mix Only)', price: 7000, category: 'SPECIAL PACKS & SAWANS', department: 'KITCHEN' },

  // 15. CHEESE KOTTU (Normal & Full)
  { name: 'Chicken Cheese Kottu', category: 'CHEESE KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1050, full: 1650, portion: 1050 }, price: 1050 },
  { name: 'Beef Cheese Kottu', category: 'CHEESE KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1100, full: 1750, portion: 1100 }, price: 1100 },
  { name: 'Prawn Cheese Kottu', category: 'CHEESE KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1100, full: 1750, portion: 1100 }, price: 1100 },
  { name: 'Sea Food Cheese Kottu', category: 'CHEESE KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1200, full: 1850, portion: 1200 }, price: 1200 },
  { name: 'Mix Cheese Kottu', category: 'CHEESE KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1300, full: 1950, portion: 1300 }, price: 1300 },

  // 16. PALANDI KOTTU (Normal & Full)
  { name: 'Chicken Palandi Kottu', category: 'PALANDI KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1100, full: 1650, portion: 1100 }, price: 1100 },
  { name: 'Beef Palandi Kottu', category: 'PALANDI KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1150, full: 1750, portion: 1150 }, price: 1150 },
  { name: 'Prawn Palandi Kottu', category: 'PALANDI KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1150, full: 1750, portion: 1150 }, price: 1150 },
  { name: 'Sea Food Palandi Kottu', category: 'PALANDI KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1200, full: 1850, portion: 1200 }, price: 1200 },
  { name: 'Mix Palandi Kottu', category: 'PALANDI KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1300, full: 1950, portion: 1300 }, price: 1300 },

  // 17. DOLPHIN KOTTU (Normal & Full)
  { name: 'Chicken Dolphin Kottu', category: 'DOLPHIN KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1100, full: 1650, portion: 1100 }, price: 1100 },
  { name: 'Beef Dolphin Kottu', category: 'DOLPHIN KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1150, full: 1750, portion: 1150 }, price: 1150 },
  { name: 'Prawn Dolphin Kottu', category: 'DOLPHIN KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1150, full: 1750, portion: 1150 }, price: 1150 },
  { name: 'Sea Food Dolphin Kottu', category: 'DOLPHIN KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1200, full: 1850, portion: 1200 }, price: 1200 },
  { name: 'Mix Dolphin Kottu', category: 'DOLPHIN KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1300, full: 1950, portion: 1300 }, price: 1300 },

  // 18. STRING HOPPER KOTTU (Normal & Full)
  { name: 'Chicken String Hopper Kottu', category: 'STRING HOPPER KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 800, full: 1300, portion: 800 }, price: 800 },
  { name: 'Beef String Hopper Kottu', category: 'STRING HOPPER KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 850, full: 1400, portion: 850 }, price: 850 },
  { name: 'Egg String Hopper Kottu', category: 'STRING HOPPER KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 800, full: 1250, portion: 800 }, price: 800 },
  { name: 'Vegetable String Hopper Kottu', category: 'STRING HOPPER KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 700, full: 1200, portion: 700 }, price: 700 },
  { name: 'Prawn String Hopper Kottu', category: 'STRING HOPPER KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 850, full: 1400, portion: 850 }, price: 850 },
  { name: 'Sea Food String Hopper Kottu', category: 'STRING HOPPER KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 950, full: 1450, portion: 950 }, price: 950 },
  { name: 'Mix String Hopper Kottu', category: 'STRING HOPPER KOTTU', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 1050, full: 1600, portion: 1050 }, price: 1050 },

  // 19. KOTTU ROTTY (Normal & Full)
  { name: 'Chicken Kottu Rotty', category: 'KOTTU ROTTY', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 750, full: 1250, portion: 750 }, price: 750 },
  { name: 'Beef Kottu Rotty', category: 'KOTTU ROTTY', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 800, full: 1350, portion: 800 }, price: 800 },
  { name: 'Egg Kottu Rotty', category: 'KOTTU ROTTY', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 700, full: 1200, portion: 700 }, price: 700 },
  { name: 'Vegetable Kottu Rotty', category: 'KOTTU ROTTY', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 650, full: 1200, portion: 650 }, price: 650 },
  { name: 'Prawn Kottu Rotty', category: 'KOTTU ROTTY', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 800, full: 1350, portion: 800 }, price: 800 },
  { name: 'Sea Food Kottu Rotty', category: 'KOTTU ROTTY', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 900, full: 1400, portion: 900 }, price: 900 },
  { name: 'Mix Kottu Rotty', category: 'KOTTU ROTTY', department: 'KITCHEN', hasPortions: true, availablePortions: ['Normal', 'Full'], portionPrices: { normal: 950, full: 1500, portion: 950 }, price: 950 },

  // 20. HAWAIIAN KOTTU (PORTION ONLY)
  { name: 'Chicken (Portion)', category: 'HAWAIIAN KOTTU (PORTION ONLY)', department: 'KITCHEN', price: 1500, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1500 } },
  { name: 'Mix (Portion)', category: 'HAWAIIAN KOTTU (PORTION ONLY)', department: 'KITCHEN', price: 1800, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1800 } },

  // 21. PEPPER KOTTU (PORTION ONLY)
  { name: 'Chicken (Portion)', category: 'PEPPER KOTTU (PORTION ONLY)', department: 'KITCHEN', price: 1350, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1350 } },
  { name: 'Beef (Portion)', category: 'PEPPER KOTTU (PORTION ONLY)', department: 'KITCHEN', price: 1450, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1450 } },
  { name: 'Mix (Portion)', category: 'PEPPER KOTTU (PORTION ONLY)', department: 'KITCHEN', price: 1650, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1650 } },

  // 22. KURUMA
  { name: 'Chicken Kuruma', price: 1500, category: 'KURUMA', department: 'KITCHEN' },
  { name: 'Beef Kuruma', price: 1600, category: 'KURUMA', department: 'KITCHEN' },
  { name: 'Mutton Kuruma', price: 2200, category: 'KURUMA', department: 'KITCHEN' },

  // 23. KADAI / WHITE KADAI
  { name: 'Chicken Kadai', price: 1500, category: 'KADAI / WHITE KADAI', department: 'KITCHEN' },
  { name: 'Beef Kadai', price: 1600, category: 'KADAI / WHITE KADAI', department: 'KITCHEN' },
  { name: 'Mutton Kadai', price: 2200, category: 'KADAI / WHITE KADAI', department: 'KITCHEN' },

  // 24. BUTTER MASALA
  { name: 'Chicken Butter Masala', price: 1500, category: 'BUTTER MASALA', department: 'KITCHEN' },
  { name: 'Beef Butter Masala', price: 1600, category: 'BUTTER MASALA', department: 'KITCHEN' },
  { name: 'Mutton Butter Masala', price: 2200, category: 'BUTTER MASALA', department: 'KITCHEN' },

  // 25. PARATA ROTTY
  { name: 'Plan Parata', price: 100, category: 'PARATA ROTTY', department: 'KITCHEN' },
  { name: 'Ghee Parata', price: 150, category: 'PARATA ROTTY', department: 'KITCHEN' },
  { name: 'Bun Parata', price: 150, category: 'PARATA ROTTY', department: 'KITCHEN' },
  { name: 'Nool Parata', price: 120, category: 'PARATA ROTTY', department: 'KITCHEN' },

  // 26. NAAN ROTTY
  { name: 'Cheese Naan', price: 280, category: 'NAAN ROTTY', department: 'KITCHEN' },
  { name: 'Butter Naan', price: 250, category: 'NAAN ROTTY', department: 'KITCHEN' },
  { name: 'Garlic Naan', price: 230, category: 'NAAN ROTTY', department: 'KITCHEN' },
  { name: 'Plan Naan', price: 200, category: 'NAAN ROTTY', department: 'KITCHEN' },
  { name: 'Naan Family Pack', price: 7000, category: 'NAAN ROTTY', department: 'KITCHEN' },

  // 27. DEVILED (PORTION ONLY)
  { name: 'Chicken (Portion)', category: 'DEVILED (PORTION ONLY)', department: 'KITCHEN', price: 1450, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1450 } },
  { name: 'Beef (Portion)', category: 'DEVILED (PORTION ONLY)', department: 'KITCHEN', price: 1600, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1600 } },
  { name: 'Prawn (Portion)', category: 'DEVILED (PORTION ONLY)', department: 'KITCHEN', price: 1600, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1600 } },
  { name: 'Cuttle Fish (Portion)', category: 'DEVILED (PORTION ONLY)', department: 'KITCHEN', price: 1600, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1600 } },
  { name: 'Fish (Portion)', category: 'DEVILED (PORTION ONLY)', department: 'KITCHEN', price: 1600, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 1600 } },
  { name: 'Mix (Portion)', category: 'DEVILED (PORTION ONLY)', department: 'KITCHEN', price: 2200, hasPortions: false, availablePortions: ['Portion'], portionPrices: { portion: 2200 } },

  // 28. BBQ & TANDOORI
  { name: 'BBQ Chicken', category: 'BBQ & TANDOORI', department: 'KITCHEN', hasPortions: true, availablePortions: ['Half', 'Full'], portionPrices: { half: 1500, full: 2600 }, price: 1500 },
  { name: 'Tandoori Chicken', category: 'BBQ & TANDOORI', department: 'KITCHEN', hasPortions: true, availablePortions: ['Quarter', 'Half'], portionPrices: { quarter: 950, half: 1700 }, price: 950 },

  // 29. KEBAB & TIKKA
  { name: 'Chicken Kebab', price: 1450, category: 'KEBAB & TIKKA', department: 'KITCHEN' },
  { name: 'Chicken Tikka', price: 1350, category: 'KEBAB & TIKKA', department: 'KITCHEN' },

  // 30. SIDE DISHES
  { name: 'Hot Butter Cuttle Fish', price: 1600, category: 'SIDE DISHES', department: 'KITCHEN' },
  { name: 'Hot Butter Prawn', price: 1600, category: 'SIDE DISHES', department: 'KITCHEN' },
  { name: 'Better Butter Chicken', price: 2000, category: 'SIDE DISHES', department: 'KITCHEN' },
  { name: 'Better Butter Prawn', price: 2000, category: 'SIDE DISHES', department: 'KITCHEN' },
  { name: 'Better Butter Cuttle Fish', price: 2200, category: 'SIDE DISHES', department: 'KITCHEN' },
  { name: 'Singapore Style Chicken', price: 1800, category: 'SIDE DISHES', department: 'KITCHEN' },
  { name: 'Singapore Style Prawn', price: 1800, category: 'SIDE DISHES', department: 'KITCHEN' },
  { name: 'Singapore Style Crab', price: 1800, category: 'SIDE DISHES', department: 'KITCHEN' },
  { name: 'Pepper Style Chicken', price: 1800, category: 'SIDE DISHES', department: 'KITCHEN' },
  { name: 'Pepper Style Beef', price: 2000, category: 'SIDE DISHES', department: 'KITCHEN' },
  { name: 'Pepper Style Prawn', price: 1800, category: 'SIDE DISHES', department: 'KITCHEN' },
  { name: 'Chopsuey Prawn', price: 1800, category: 'SIDE DISHES', department: 'KITCHEN' },
  { name: 'Cashew and Chilli with Prawn', price: 2000, category: 'SIDE DISHES', department: 'KITCHEN' },

  // 31. PASTA
  { name: 'Chicken Pasta', price: 1350, category: 'PASTA', department: 'KITCHEN' },
  { name: 'Beef Pasta', price: 1450, category: 'PASTA', department: 'KITCHEN' },
  { name: 'Mix Pasta', price: 1550, category: 'PASTA', department: 'KITCHEN' },
  { name: 'Seafood Pasta', price: 1550, category: 'PASTA', department: 'KITCHEN' },

  // 32. MEE GORENG
  { name: 'Chicken Mee Goreng', price: 1350, category: 'MEE GORENG', department: 'KITCHEN' },
  { name: 'Beef Mee Goreng', price: 1450, category: 'MEE GORENG', department: 'KITCHEN' },
  { name: 'Mix Mee Goreng', price: 1550, category: 'MEE GORENG', department: 'KITCHEN' },
  { name: 'Seafood Mee Goreng', price: 1550, category: 'MEE GORENG', department: 'KITCHEN' },

  // 33. SUBMARINE
  { name: 'Chicken Submarine', price: 1100, category: 'SUBMARINE', department: 'BUN' },
  { name: 'Crispy Chicken Submarine', price: 1200, category: 'SUBMARINE', department: 'BUN' },
  { name: 'Beef Submarine', price: 1400, category: 'SUBMARINE', department: 'BUN' },
  { name: 'Mix Submarine', price: 1500, category: 'SUBMARINE', department: 'BUN' },

  // 34. SHAWARMA
  { name: 'Chicken Shawarma', price: 1200, category: 'SHAWARMA', department: 'BUN' },
  { name: 'Crispy Chicken Shawarma', price: 1350, category: 'SHAWARMA', department: 'BUN' },
  { name: 'Beef Shawarma', price: 1450, category: 'SHAWARMA', department: 'BUN' },
  { name: 'Mix Shawarma', price: 1500, category: 'SHAWARMA', department: 'BUN' },

  // 35. BURGER
  { name: 'Chicken Burger', price: 900, category: 'BURGER', department: 'BUN' },
  { name: 'Double Chicken Burger', price: 1200, category: 'BURGER', department: 'BUN' },
  { name: 'Double Cheese Burger', price: 1300, category: 'BURGER', department: 'BUN' },
  { name: 'Crispy Chicken Burger', price: 1100, category: 'BURGER', department: 'BUN' },
  { name: 'Beef Burger', price: 1100, category: 'BURGER', department: 'BUN' },

  // 36. SANDWICH (Without Cheese & With Cheese)
  { name: 'Chicken Sandwich', category: 'SANDWICH', department: 'BUN', hasPortions: true, availablePortions: ['Without Cheese', 'With Cheese'], portionPrices: { withoutCheese: 850, withCheese: 950 }, price: 850 },
  { name: 'Beef Sandwich', category: 'SANDWICH', department: 'BUN', hasPortions: true, availablePortions: ['Without Cheese', 'With Cheese'], portionPrices: { withoutCheese: 1050, withCheese: 1150 }, price: 1050 },
  { name: 'Egg Sandwich', category: 'SANDWICH', department: 'BUN', hasPortions: true, availablePortions: ['Without Cheese', 'With Cheese'], portionPrices: { withoutCheese: 650, withCheese: 750 }, price: 650 },
  { name: 'Vegetable Sandwich', category: 'SANDWICH', department: 'BUN', hasPortions: true, availablePortions: ['Without Cheese', 'With Cheese'], portionPrices: { withoutCheese: 650, withCheese: 750 }, price: 650 },

  // 37. ICE CREAM
  { name: 'Vanilla Ice Cream', price: 280, category: 'ICE CREAM', department: 'JUICE' },
  { name: 'Chocolate Ice Cream', price: 280, category: 'ICE CREAM', department: 'JUICE' },
  { name: 'Strawberry Ice Cream', price: 280, category: 'ICE CREAM', department: 'JUICE' },
  { name: 'Mango Ice Cream', price: 280, category: 'ICE CREAM', department: 'JUICE' },
  { name: 'Blueberry Ice Cream', price: 280, category: 'ICE CREAM', department: 'JUICE' },
  { name: 'Banana Ice Cream', price: 280, category: 'ICE CREAM', department: 'JUICE' },
  { name: 'Coffee Ice Cream', price: 280, category: 'ICE CREAM', department: 'JUICE' },

  // 38. LESSI
  { name: 'Sweet Lessi', price: 450, category: 'LESSI', department: 'JUICE' },
  { name: 'Mango Lessi', price: 500, category: 'LESSI', department: 'JUICE' },
  { name: 'Vanilla Lessi', price: 500, category: 'LESSI', department: 'JUICE' },
  { name: 'Strawberry Lessi', price: 500, category: 'LESSI', department: 'JUICE' },
  { name: 'Blueberry Lessi', price: 500, category: 'LESSI', department: 'JUICE' },
  { name: 'Fruit and Nut Lessi', price: 550, category: 'LESSI', department: 'JUICE' },

  // 39. NUTS ICE CREAM
  { name: 'Vanilla Nut Ice Cream', price: 320, category: 'NUTS ICE CREAM', department: 'JUICE' },
  { name: 'Chocolate Nut Ice Cream', price: 320, category: 'NUTS ICE CREAM', department: 'JUICE' },
  { name: 'Fruit and Nut Ice Cream', price: 320, category: 'NUTS ICE CREAM', department: 'JUICE' },
  { name: 'Kithul Nut Ice Cream', price: 320, category: 'NUTS ICE CREAM', department: 'JUICE' },

  // 40. FRESH JUICE
  { name: 'Mango Juice', price: 400, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Orange Juice', price: 450, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Papaya Juice', price: 250, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Avocado Juice', price: 350, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Pine Apple Juice', price: 350, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Grapes Juice', price: 450, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Passion Fruit Juice', price: 300, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Apple Juice', price: 450, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Mixed Fruit Juice', price: 400, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Watermelon Juice', price: 350, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Banana Juice', price: 250, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Nelli Crush', price: 250, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Nannari', price: 250, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Lemon Juice', price: 250, category: 'FRESH JUICE', department: 'JUICE' },
  { name: 'Lime Juice', price: 250, category: 'FRESH JUICE', department: 'JUICE' },

  // 41. KULFI
  { name: 'Badham Kulfi', price: 350, category: 'KULFI', department: 'JUICE' },
  { name: 'Strawberry Kulfi', price: 450, category: 'KULFI', department: 'JUICE' },

  // 42. MILKSHAKE
  { name: 'Vanilla Milkshake', price: 450, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Chocolate Milkshake', price: 450, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Strawberry Milkshake', price: 450, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Mango Milkshake', price: 450, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Banana Milkshake', price: 450, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Blueberry Milkshake', price: 450, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Ice Coffee', price: 400, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Coffee Shake', price: 450, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Choco Smoothie', price: 500, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Ice Milo', price: 500, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Date Shake', price: 500, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Badham Milk', price: 500, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Fruit and Nuts Shake', price: 500, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Kit kat Shake', price: 600, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Snikers Shake', price: 600, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Vanilla Smoothie', price: 500, category: 'MILKSHAKE', department: 'JUICE' },
  { name: 'Oreo Shake', price: 600, category: 'MILKSHAKE', department: 'JUICE' },

  // 43. KIDS ICE CREAM
  { name: 'Kids Vanilla', price: 180, category: 'KIDS ICE CREAM', department: 'JUICE' },
  { name: 'Kids Chocolate', price: 180, category: 'KIDS ICE CREAM', department: 'JUICE' },
  { name: 'Kids Strawberry', price: 180, category: 'KIDS ICE CREAM', department: 'JUICE' },
  { name: 'Kids Mango', price: 180, category: 'KIDS ICE CREAM', department: 'JUICE' },
  { name: 'Kids Blueberry', price: 180, category: 'KIDS ICE CREAM', department: 'JUICE' },
  { name: 'Kids Banana', price: 180, category: 'KIDS ICE CREAM', department: 'JUICE' },
  { name: 'Kids Fruit and Nut', price: 220, category: 'KIDS ICE CREAM', department: 'JUICE' },
  { name: 'Kids Chocolate Nut', price: 220, category: 'KIDS ICE CREAM', department: 'JUICE' },
  { name: 'Kids Vanilla Nut', price: 220, category: 'KIDS ICE CREAM', department: 'JUICE' },
  { name: 'Kids Kithul Nut', price: 220, category: 'KIDS ICE CREAM', department: 'JUICE' },

  // 44. MOJITO
  { name: 'Strawberry Mojito', price: 600, category: 'MOJITO', department: 'JUICE' },
  { name: 'Black Currant Mojito', price: 600, category: 'MOJITO', department: 'JUICE' },
  { name: 'Blue Ocean Mojito', price: 600, category: 'MOJITO', department: 'JUICE' },
  { name: 'Apple Mojito', price: 600, category: 'MOJITO', department: 'JUICE' },
  { name: 'Pomegranate Mojito', price: 600, category: 'MOJITO', department: 'JUICE' },

  // 45. COOL TREATS SPECIAL
  { name: 'Ice Talk Special', price: 400, category: 'COOL TREATS SPECIAL', department: 'JUICE' },
  { name: 'Ice Talk Special Nuts', price: 450, category: 'COOL TREATS SPECIAL', department: 'JUICE' },
  { name: 'Jelly Ice Cream', price: 350, category: 'COOL TREATS SPECIAL', department: 'JUICE' },
  { name: 'Banana Flick Flack', price: 350, category: 'COOL TREATS SPECIAL', department: 'JUICE' },
  { name: 'Banana Boat', price: 450, category: 'COOL TREATS SPECIAL', department: 'JUICE' },
  { name: 'Mixed Ice Cream', price: 350, category: 'COOL TREATS SPECIAL', department: 'JUICE' },
  { name: 'Fruit Salad', price: 550, category: 'COOL TREATS SPECIAL', department: 'JUICE' },
  { name: 'Fruit Salad with Ice Cream', price: 650, category: 'COOL TREATS SPECIAL', department: 'JUICE' },
  { name: 'Royal Faluda', price: 500, category: 'COOL TREATS SPECIAL', department: 'JUICE' },
  { name: 'Faluda with Ice Cream', price: 350, category: 'COOL TREATS SPECIAL', department: 'JUICE' },
  { name: 'Jumbo Mix', price: 650, category: 'COOL TREATS SPECIAL', department: 'JUICE' },
  { name: 'Boondhi Ice Cream', price: 350, category: 'COOL TREATS SPECIAL', department: 'JUICE' },
  { name: 'Puttu Ice Cream', price: 750, category: 'COOL TREATS SPECIAL', department: 'JUICE' },

  // 46. SPECIAL MILK SHAKE
  { name: 'Special Vanilla Shake', price: 750, category: 'SPECIAL MILK SHAKE', department: 'JUICE' },
  { name: 'Special Strawberry Shake', price: 750, category: 'SPECIAL MILK SHAKE', department: 'JUICE' },
  { name: 'Special Chocolate Shake', price: 750, category: 'SPECIAL MILK SHAKE', department: 'JUICE' },
  { name: 'Special Icemilo Shake', price: 780, category: 'SPECIAL MILK SHAKE', department: 'JUICE' },
  { name: 'Special Oreo Shake', price: 780, category: 'SPECIAL MILK SHAKE', department: 'JUICE' },

  // 47. BUBBLE TEA
  { name: 'Bubble Tea (Chocolate, Strawberry, Blueberry, Mango)', price: 900, category: 'BUBBLE TEA', department: 'JUICE' },
];

// Complete normalized items
const formattedItems = menuItemsData.map((item) => {
  return {
    name: item.name,
    description: '',
    price: item.price,
    category: item.category,
    department: item.department,
    isAvailable: true,
    isPopular: false,
    prepTimeMinutes: item.department === 'JUICE' ? 5 : item.department === 'BUN' ? 5 : 12,
    hasPortions: item.hasPortions || false,
    availablePortions: item.availablePortions || ['Standard'],
    portionPrices: item.portionPrices || { portion: item.price },
  };
});

// Write to restaurantMenu.js file
const fileContent = `/**
 * Complete Ice Talk Family Restaurant Menu Data
 * Exact 47 categories matching the restaurant menu.
 * Sizing options: Normal, Full, Half, Quarter, and Portion.
 */

const defaultCategories = ${JSON.stringify(categoriesDef, null, 2)};

const defaultMenuItems = ${JSON.stringify(formattedItems, null, 2)};

module.exports = {
  defaultCategories,
  defaultMenuItems,
};
`;

fs.writeFileSync(path.join(__dirname, '../data/restaurantMenu.js'), fileContent, 'utf8');
console.log(`[File] Successfully generated restaurantMenu.js with ${formattedItems.length} items across ${categoriesDef.length} categories.`);

// Now Sync with MongoDB Atlas
async function syncDatabase() {
  try {
    console.log('[Mongo] Connecting to MongoDB Atlas...');
    await connectDB();

    console.log('[Mongo] Replacing categories...');
    await Category.deleteMany({});
    const insertedCats = await Category.insertMany(categoriesDef);
    console.log('[Mongo] Inserted ' + insertedCats.length + ' categories.');

    console.log('[Mongo] Replacing menu items...');
    await MenuItem.deleteMany({});
    const insertedItems = await MenuItem.insertMany(formattedItems);
    console.log('[Mongo] Inserted ' + insertedItems.length + ' menu items!');

    const normalCount = insertedItems.filter((i) => (i.availablePortions || []).includes('Normal')).length;
    const portionCount = insertedItems.filter((i) => i.name.includes('(Portion)')).length;
    console.log('[Mongo] Multi-size items with Normal & Full: ' + normalCount);
    console.log('[Mongo] Portion-only items explicitly labeled (Portion): ' + portionCount);

    console.log('[Mongo] Direct sync complete!');
    process.exit(0);
  } catch (err) {
    console.error('[Mongo] Sync error:', err);
    process.exit(1);
  }
}

syncDatabase();
