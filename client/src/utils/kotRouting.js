/**
 * Ice Talk POS - KOT Routing & Category Detection Utilities
 * 
 * Auto-detects preparation stations and printer routing based on Menu Item Category:
 * - KITCHEN: Rice, Kottu, Burgers, Noodles, Curries, Hot Meals, Appetizers, Mains
 * - JUICE: Fruit Juices, Milkshakes, Falooda, Desserts, Ice Cream, Sweets, Beverages
 * - BUN: Bakery Buns, Short Eats, Rolls, Pastries, Patties, Samosas, Snacks, Sandwiches
 */

export const detectKOTSection = (categoryName, explicitDept = null) => {
  const dept = (explicitDept || '').trim().toUpperCase();

  // 1. If an explicit station was selected by the user (JUICE, BUN, KITCHEN, OTHER), respect it directly!
  if (['JUICE', 'BUN', 'KITCHEN', 'OTHER'].includes(dept)) {
    return dept;
  }

  const cat = (categoryName || '').trim().toLowerCase();

  // 2. Detect from Category Name keywords
  // JUICE & DESSERTS (Beverages, Shakes, Falooda, Ice Cream, Desserts, Sweets)
  if (
    cat.includes('juice') ||
    cat.includes('shake') ||
    cat.includes('milkshake') ||
    cat.includes('smoothie') ||
    cat.includes('mojito') ||
    cat.includes('falooda') ||
    cat.includes('ice cream') ||
    cat.includes('icecream') ||
    cat.includes('dessert') ||
    cat.includes('sweet') ||
    cat.includes('drink') ||
    cat.includes('beverage') ||
    cat.includes('tea') ||
    cat.includes('coffee') ||
    cat.includes('brownie') ||
    cat.includes('cake') ||
    cat.includes('sundae') ||
    cat.includes('frappe')
  ) {
    return 'JUICE';
  }

  // BUNS & SHORT EATS (Bakery, Buns, Rolls, Pastries, Patties, Samosas, Snacks, Sandwiches)
  if (
    cat.includes('bun') ||
    cat.includes('short eat') ||
    cat.includes('shorteat') ||
    cat.includes('bakery') ||
    cat.includes('roll') ||
    cat.includes('pastry') ||
    cat.includes('patties') ||
    cat.includes('patty') ||
    cat.includes('samosa') ||
    cat.includes('sandwich') ||
    cat.includes('snack')
  ) {
    return 'BUN';
  }

  // RICE & KITCHEN (Rice, Kottu, Burgers, Noodles, Curries, Hot Meals, Mains, Grills)
  if (
    cat.includes('rice') ||
    cat.includes('kottu') ||
    cat.includes('kotthu') ||
    cat.includes('burger') ||
    cat.includes('noodle') ||
    cat.includes('pasta') ||
    cat.includes('curry') ||
    cat.includes('gravy') ||
    cat.includes('hot') ||
    cat.includes('meal') ||
    cat.includes('main') ||
    cat.includes('kitchen') ||
    cat.includes('soup') ||
    cat.includes('appetizer') ||
    cat.includes('fried') ||
    cat.includes('bbq') ||
    cat.includes('grill') ||
    cat.includes('chicken') ||
    cat.includes('beef') ||
    cat.includes('seafood')
  ) {
    return 'KITCHEN';
  }

  if (cat.includes('other')) {
    return 'OTHER';
  }

  return 'KITCHEN';
};

export const getDeptDisplayName = (deptCode) => {
  switch (deptCode?.toUpperCase()) {
    case 'KITCHEN':
      return 'RICE & KITCHEN';
    case 'JUICE':
      return 'JUICE & DESSERTS';
    case 'BUN':
      return 'BUNS & SHORT EATS';
    case 'OTHER':
      return 'OTHER ITEMS';
    default:
      return deptCode || 'RICE & KITCHEN';
  }
};

export const getStationPrinterKey = (deptCode) => {
  switch (deptCode?.toUpperCase()) {
    case 'KITCHEN':
      return 'kitchenPrinter';
    case 'JUICE':
      return 'juicePrinter';
    case 'BUN':
      return 'bunPrinter';
    default:
      return 'kitchenPrinter';
  }
};
