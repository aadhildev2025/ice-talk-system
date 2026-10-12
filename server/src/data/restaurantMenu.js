/**
 * Complete Ice Talk Family Restaurant Menu Data
 * Exact 47 categories matching the restaurant menu.
 * Sizing options: Normal, Full, Half, Quarter, and Portion.
 */

const defaultCategories = [
  {
    "name": "All",
    "icon": "LayoutGrid",
    "sortOrder": 0,
    "department": "KITCHEN"
  },
  {
    "name": "STARTER & SALADS",
    "icon": "Utensils",
    "sortOrder": 1,
    "department": "KITCHEN"
  },
  {
    "name": "SHORT EATS",
    "icon": "Cookie",
    "sortOrder": 2,
    "department": "BUN"
  },
  {
    "name": "SOUP",
    "icon": "Coffee",
    "sortOrder": 3,
    "department": "KITCHEN"
  },
  {
    "name": "CURRY",
    "icon": "Bowl",
    "sortOrder": 4,
    "department": "KITCHEN"
  },
  {
    "name": "FRIED RICE",
    "icon": "UtensilsCrossed",
    "sortOrder": 5,
    "department": "KITCHEN"
  },
  {
    "name": "SPECIAL FRIED RICE",
    "icon": "Flame",
    "sortOrder": 6,
    "department": "KITCHEN"
  },
  {
    "name": "GHEE FRIED RICE (PORTION ONLY)",
    "icon": "ChefHat",
    "sortOrder": 7,
    "department": "KITCHEN"
  },
  {
    "name": "CHOPSUEY RICE (PORTION ONLY)",
    "icon": "Utensils",
    "sortOrder": 8,
    "department": "KITCHEN"
  },
  {
    "name": "MONGOLIAN RICE",
    "icon": "Flame",
    "sortOrder": 9,
    "department": "KITCHEN"
  },
  {
    "name": "NASI GORENG",
    "icon": "Sparkles",
    "sortOrder": 10,
    "department": "KITCHEN"
  },
  {
    "name": "NOODLES",
    "icon": "Utensils",
    "sortOrder": 11,
    "department": "KITCHEN"
  },
  {
    "name": "CHOPSUEY NOODLES (PORTION ONLY)",
    "icon": "Utensils",
    "sortOrder": 12,
    "department": "KITCHEN"
  },
  {
    "name": "BIRIYANI (PORTION ONLY)",
    "icon": "ChefHat",
    "sortOrder": 13,
    "department": "KITCHEN"
  },
  {
    "name": "SPECIAL PACKS & SAWANS",
    "icon": "Users",
    "sortOrder": 14,
    "department": "KITCHEN"
  },
  {
    "name": "CHEESE KOTTU",
    "icon": "Flame",
    "sortOrder": 15,
    "department": "KITCHEN"
  },
  {
    "name": "PALANDI KOTTU",
    "icon": "Flame",
    "sortOrder": 16,
    "department": "KITCHEN"
  },
  {
    "name": "DOLPHIN KOTTU",
    "icon": "Flame",
    "sortOrder": 17,
    "department": "KITCHEN"
  },
  {
    "name": "STRING HOPPER KOTTU",
    "icon": "Layers",
    "sortOrder": 18,
    "department": "KITCHEN"
  },
  {
    "name": "KOTTU ROTTY",
    "icon": "Layers",
    "sortOrder": 19,
    "department": "KITCHEN"
  },
  {
    "name": "HAWAIIAN KOTTU (PORTION ONLY)",
    "icon": "Flame",
    "sortOrder": 20,
    "department": "KITCHEN"
  },
  {
    "name": "PEPPER KOTTU (PORTION ONLY)",
    "icon": "Flame",
    "sortOrder": 21,
    "department": "KITCHEN"
  },
  {
    "name": "KURUMA",
    "icon": "Bowl",
    "sortOrder": 22,
    "department": "KITCHEN"
  },
  {
    "name": "KADAI / WHITE KADAI",
    "icon": "Bowl",
    "sortOrder": 23,
    "department": "KITCHEN"
  },
  {
    "name": "BUTTER MASALA",
    "icon": "Bowl",
    "sortOrder": 24,
    "department": "KITCHEN"
  },
  {
    "name": "PARATA ROTTY",
    "icon": "Disc",
    "sortOrder": 25,
    "department": "KITCHEN"
  },
  {
    "name": "NAAN ROTTY",
    "icon": "Disc",
    "sortOrder": 26,
    "department": "KITCHEN"
  },
  {
    "name": "DEVILED (PORTION ONLY)",
    "icon": "Flame",
    "sortOrder": 27,
    "department": "KITCHEN"
  },
  {
    "name": "BBQ & TANDOORI",
    "icon": "Flame",
    "sortOrder": 28,
    "department": "KITCHEN"
  },
  {
    "name": "KEBAB & TIKKA",
    "icon": "Flame",
    "sortOrder": 29,
    "department": "KITCHEN"
  },
  {
    "name": "SIDE DISHES",
    "icon": "Flame",
    "sortOrder": 30,
    "department": "KITCHEN"
  },
  {
    "name": "PASTA",
    "icon": "Utensils",
    "sortOrder": 31,
    "department": "KITCHEN"
  },
  {
    "name": "MEE GORENG",
    "icon": "Utensils",
    "sortOrder": 32,
    "department": "KITCHEN"
  },
  {
    "name": "SUBMARINE",
    "icon": "Sandwich",
    "sortOrder": 33,
    "department": "BUN"
  },
  {
    "name": "SHAWARMA",
    "icon": "Sandwich",
    "sortOrder": 34,
    "department": "BUN"
  },
  {
    "name": "BURGER",
    "icon": "Beef",
    "sortOrder": 35,
    "department": "BUN"
  },
  {
    "name": "SANDWICH",
    "icon": "Sandwich",
    "sortOrder": 36,
    "department": "BUN"
  },
  {
    "name": "ICE CREAM",
    "icon": "IceCream",
    "sortOrder": 37,
    "department": "JUICE"
  },
  {
    "name": "LESSI",
    "icon": "GlassWater",
    "sortOrder": 38,
    "department": "JUICE"
  },
  {
    "name": "NUTS ICE CREAM",
    "icon": "IceCream",
    "sortOrder": 39,
    "department": "JUICE"
  },
  {
    "name": "FRESH JUICE",
    "icon": "GlassWater",
    "sortOrder": 40,
    "department": "JUICE"
  },
  {
    "name": "KULFI",
    "icon": "IceCream",
    "sortOrder": 41,
    "department": "JUICE"
  },
  {
    "name": "MILKSHAKE",
    "icon": "CupSoda",
    "sortOrder": 42,
    "department": "JUICE"
  },
  {
    "name": "KIDS ICE CREAM",
    "icon": "Sparkles",
    "sortOrder": 43,
    "department": "JUICE"
  },
  {
    "name": "MOJITO",
    "icon": "GlassWater",
    "sortOrder": 44,
    "department": "JUICE"
  },
  {
    "name": "COOL TREATS SPECIAL",
    "icon": "Cherry",
    "sortOrder": 45,
    "department": "JUICE"
  },
  {
    "name": "SPECIAL MILK SHAKE",
    "icon": "CupSoda",
    "sortOrder": 46,
    "department": "JUICE"
  },
  {
    "name": "BUBBLE TEA",
    "icon": "CupSoda",
    "sortOrder": 47,
    "department": "JUICE"
  }
];

const defaultMenuItems = [
  {
    "name": "French Fries",
    "description": "",
    "price": 750,
    "category": "STARTER & SALADS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 750
    }
  },
  {
    "name": "Fish Finger with French Fries",
    "description": "",
    "price": 1100,
    "category": "STARTER & SALADS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1100
    }
  },
  {
    "name": "Fruit & Vegetable Salad",
    "description": "",
    "price": 1100,
    "category": "STARTER & SALADS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1100
    }
  },
  {
    "name": "Chicken Salad",
    "description": "",
    "price": 850,
    "category": "STARTER & SALADS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 850
    }
  },
  {
    "name": "Vegetable Salad",
    "description": "",
    "price": 800,
    "category": "STARTER & SALADS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 800
    }
  },
  {
    "name": "Beef Salad",
    "description": "",
    "price": 1100,
    "category": "STARTER & SALADS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1100
    }
  },
  {
    "name": "Special Salad",
    "description": "",
    "price": 1300,
    "category": "STARTER & SALADS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1300
    }
  },
  {
    "name": "Roll",
    "description": "",
    "price": 100,
    "category": "SHORT EATS",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 100
    }
  },
  {
    "name": "Mini Kives",
    "description": "",
    "price": 80,
    "category": "SHORT EATS",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 80
    }
  },
  {
    "name": "Drummer",
    "description": "",
    "price": 120,
    "category": "SHORT EATS",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 120
    }
  },
  {
    "name": "Nuggets",
    "description": "",
    "price": 350,
    "category": "SHORT EATS",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 350
    }
  },
  {
    "name": "Vegetable Soup",
    "description": "",
    "price": 400,
    "category": "SOUP",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 400
    }
  },
  {
    "name": "Egg Soup",
    "description": "",
    "price": 450,
    "category": "SOUP",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Chicken Soup",
    "description": "",
    "price": 550,
    "category": "SOUP",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 550
    }
  },
  {
    "name": "Beef Soup",
    "description": "",
    "price": 750,
    "category": "SOUP",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 750
    }
  },
  {
    "name": "Sea Food Soup",
    "description": "",
    "price": 750,
    "category": "SOUP",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 750
    }
  },
  {
    "name": "Sweet Corn Chicken Soup",
    "description": "",
    "price": 1100,
    "category": "SOUP",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1100
    }
  },
  {
    "name": "Sweet Corn Sea Food Soup",
    "description": "",
    "price": 1100,
    "category": "SOUP",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1100
    }
  },
  {
    "name": "Cream of Chicken Soup",
    "description": "",
    "price": 1050,
    "category": "SOUP",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1050
    }
  },
  {
    "name": "Cream of Vegetable Soup",
    "description": "",
    "price": 900,
    "category": "SOUP",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 900
    }
  },
  {
    "name": "Chicken Curry",
    "description": "",
    "price": 1400,
    "category": "CURRY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1400
    }
  },
  {
    "name": "Beef Curry",
    "description": "",
    "price": 1600,
    "category": "CURRY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1600
    }
  },
  {
    "name": "Mutton Curry",
    "description": "",
    "price": 2200,
    "category": "CURRY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 2200
    }
  },
  {
    "name": "Chicken Rice",
    "description": "",
    "price": 950,
    "category": "FRIED RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 950,
      "full": 1600,
      "portion": 950
    }
  },
  {
    "name": "Beef Rice",
    "description": "",
    "price": 1000,
    "category": "FRIED RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1000,
      "full": 1700,
      "portion": 1000
    }
  },
  {
    "name": "Prawn Rice",
    "description": "",
    "price": 1000,
    "category": "FRIED RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1000,
      "full": 1700,
      "portion": 1000
    }
  },
  {
    "name": "Cuttle Fish Rice",
    "description": "",
    "price": 1000,
    "category": "FRIED RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1000,
      "full": 1700,
      "portion": 1000
    }
  },
  {
    "name": "Fish Rice",
    "description": "",
    "price": 1000,
    "category": "FRIED RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1000,
      "full": 1700,
      "portion": 1000
    }
  },
  {
    "name": "Egg Rice",
    "description": "",
    "price": 800,
    "category": "FRIED RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 800,
      "full": 1400,
      "portion": 800
    }
  },
  {
    "name": "Vegetable Rice",
    "description": "",
    "price": 800,
    "category": "FRIED RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 800,
      "full": 1300,
      "portion": 800
    }
  },
  {
    "name": "Mix Rice",
    "description": "",
    "price": 1100,
    "category": "FRIED RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1100,
      "full": 2000,
      "portion": 1100
    }
  },
  {
    "name": "Special Rice (Seafood Only)",
    "description": "",
    "price": 1300,
    "category": "FRIED RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1300,
      "full": 2400,
      "portion": 1300
    }
  },
  {
    "name": "Special Chicken Fried Rice",
    "description": "",
    "price": 1450,
    "category": "SPECIAL FRIED RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1450,
      "full": 2200,
      "portion": 1450
    }
  },
  {
    "name": "Special Beef Fried Rice",
    "description": "",
    "price": 1500,
    "category": "SPECIAL FRIED RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1500,
      "full": 2300,
      "portion": 1500
    }
  },
  {
    "name": "Special Mix Fried Rice",
    "description": "",
    "price": 1550,
    "category": "SPECIAL FRIED RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1550,
      "full": 2400,
      "portion": 1550
    }
  },
  {
    "name": "Chicken (Portion)",
    "description": "",
    "price": 1300,
    "category": "GHEE FRIED RICE (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1300
    }
  },
  {
    "name": "Beef (Portion)",
    "description": "",
    "price": 1400,
    "category": "GHEE FRIED RICE (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1400
    }
  },
  {
    "name": "Sea Food (Portion)",
    "description": "",
    "price": 1550,
    "category": "GHEE FRIED RICE (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1550
    }
  },
  {
    "name": "Mix (Portion)",
    "description": "",
    "price": 1550,
    "category": "GHEE FRIED RICE (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1550
    }
  },
  {
    "name": "Vegetable (Portion)",
    "description": "",
    "price": 1050,
    "category": "CHOPSUEY RICE (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1050
    }
  },
  {
    "name": "Chicken (Portion)",
    "description": "",
    "price": 1450,
    "category": "CHOPSUEY RICE (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1450
    }
  },
  {
    "name": "Sea Food (Portion)",
    "description": "",
    "price": 1850,
    "category": "CHOPSUEY RICE (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1850
    }
  },
  {
    "name": "Chicken Mongolian Rice",
    "description": "",
    "price": 1150,
    "category": "MONGOLIAN RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1150,
      "full": 2100,
      "portion": 1150
    }
  },
  {
    "name": "Beef Mongolian Rice",
    "description": "",
    "price": 1200,
    "category": "MONGOLIAN RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1200,
      "full": 2200,
      "portion": 1200
    }
  },
  {
    "name": "Prawn Mongolian Rice",
    "description": "",
    "price": 1200,
    "category": "MONGOLIAN RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1200,
      "full": 2200,
      "portion": 1200
    }
  },
  {
    "name": "Sea Food Mongolian Rice",
    "description": "",
    "price": 1300,
    "category": "MONGOLIAN RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1300,
      "full": 2300,
      "portion": 1300
    }
  },
  {
    "name": "Mix Mongolian Rice",
    "description": "",
    "price": 1350,
    "category": "MONGOLIAN RICE",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1350,
      "full": 2400,
      "portion": 1350
    }
  },
  {
    "name": "Chicken Nasi Goreng",
    "description": "",
    "price": 1150,
    "category": "NASI GORENG",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1150,
      "full": 1950,
      "portion": 1150
    }
  },
  {
    "name": "Beef Nasi Goreng",
    "description": "",
    "price": 1200,
    "category": "NASI GORENG",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1200,
      "full": 2050,
      "portion": 1200
    }
  },
  {
    "name": "Prawn Nasi Goreng",
    "description": "",
    "price": 1200,
    "category": "NASI GORENG",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1200,
      "full": 2050,
      "portion": 1200
    }
  },
  {
    "name": "Sea Food Nasi Goreng",
    "description": "",
    "price": 1250,
    "category": "NASI GORENG",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1250,
      "full": 2200,
      "portion": 1250
    }
  },
  {
    "name": "Mix Nasi Goreng",
    "description": "",
    "price": 1300,
    "category": "NASI GORENG",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1300,
      "full": 2350,
      "portion": 1300
    }
  },
  {
    "name": "Chicken Noodles",
    "description": "",
    "price": 750,
    "category": "NOODLES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 750,
      "full": 1250,
      "portion": 750
    }
  },
  {
    "name": "Beef Noodles",
    "description": "",
    "price": 800,
    "category": "NOODLES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 800,
      "full": 1350,
      "portion": 800
    }
  },
  {
    "name": "Egg Noodles",
    "description": "",
    "price": 700,
    "category": "NOODLES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 700,
      "full": 1200,
      "portion": 700
    }
  },
  {
    "name": "Vegetable Noodles",
    "description": "",
    "price": 650,
    "category": "NOODLES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 650,
      "full": 1200,
      "portion": 650
    }
  },
  {
    "name": "Prawn Noodles",
    "description": "",
    "price": 800,
    "category": "NOODLES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 800,
      "full": 1350,
      "portion": 800
    }
  },
  {
    "name": "Sea Food Noodles",
    "description": "",
    "price": 900,
    "category": "NOODLES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 900,
      "full": 1400,
      "portion": 900
    }
  },
  {
    "name": "Mix Noodles",
    "description": "",
    "price": 950,
    "category": "NOODLES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 950,
      "full": 1500,
      "portion": 950
    }
  },
  {
    "name": "Vegetable (Portion)",
    "description": "",
    "price": 1050,
    "category": "CHOPSUEY NOODLES (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1050
    }
  },
  {
    "name": "Chicken (Portion)",
    "description": "",
    "price": 1400,
    "category": "CHOPSUEY NOODLES (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1400
    }
  },
  {
    "name": "Sea Food (Portion)",
    "description": "",
    "price": 1800,
    "category": "CHOPSUEY NOODLES (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1800
    }
  },
  {
    "name": "Chicken (Portion)",
    "description": "",
    "price": 1650,
    "category": "BIRIYANI (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1650
    }
  },
  {
    "name": "Beef (Portion)",
    "description": "",
    "price": 2000,
    "category": "BIRIYANI (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 2000
    }
  },
  {
    "name": "Mutton (Portion)",
    "description": "",
    "price": 2500,
    "category": "BIRIYANI (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 2500
    }
  },
  {
    "name": "Prawn (Portion)",
    "description": "",
    "price": 2000,
    "category": "BIRIYANI (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 2000
    }
  },
  {
    "name": "Fish (Portion)",
    "description": "",
    "price": 2000,
    "category": "BIRIYANI (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 2000
    }
  },
  {
    "name": "Ice Talk Family Pack (Sea Food Only)",
    "description": "",
    "price": 6500,
    "category": "SPECIAL PACKS & SAWANS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 6500
    }
  },
  {
    "name": "Ice Talk Sawal Special (Mix Only)",
    "description": "",
    "price": 7000,
    "category": "SPECIAL PACKS & SAWANS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 7000
    }
  },
  {
    "name": "Biriyani Sawan (Chicken)",
    "description": "",
    "price": 8500,
    "category": "SPECIAL PACKS & SAWANS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 8500
    }
  },
  {
    "name": "Biriyani Sawan (Beef)",
    "description": "",
    "price": 9500,
    "category": "SPECIAL PACKS & SAWANS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 9500
    }
  },
  {
    "name": "Biriyani Sawan (Prawn)",
    "description": "",
    "price": 9500,
    "category": "SPECIAL PACKS & SAWANS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 9500
    }
  },
  {
    "name": "Biriyani Sawan (Fish)",
    "description": "",
    "price": 8500,
    "category": "SPECIAL PACKS & SAWANS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 8500
    }
  },
  {
    "name": "Nasi Goreng Sawan (Mix Only)",
    "description": "",
    "price": 6500,
    "category": "SPECIAL PACKS & SAWANS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 6500
    }
  },
  {
    "name": "Mongolian Sawan (Mix Only)",
    "description": "",
    "price": 7000,
    "category": "SPECIAL PACKS & SAWANS",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 7000
    }
  },
  {
    "name": "Chicken Cheese Kottu",
    "description": "",
    "price": 1050,
    "category": "CHEESE KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1050,
      "full": 1650,
      "portion": 1050
    }
  },
  {
    "name": "Beef Cheese Kottu",
    "description": "",
    "price": 1100,
    "category": "CHEESE KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1100,
      "full": 1750,
      "portion": 1100
    }
  },
  {
    "name": "Prawn Cheese Kottu",
    "description": "",
    "price": 1100,
    "category": "CHEESE KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1100,
      "full": 1750,
      "portion": 1100
    }
  },
  {
    "name": "Sea Food Cheese Kottu",
    "description": "",
    "price": 1200,
    "category": "CHEESE KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1200,
      "full": 1850,
      "portion": 1200
    }
  },
  {
    "name": "Mix Cheese Kottu",
    "description": "",
    "price": 1300,
    "category": "CHEESE KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1300,
      "full": 1950,
      "portion": 1300
    }
  },
  {
    "name": "Chicken Palandi Kottu",
    "description": "",
    "price": 1100,
    "category": "PALANDI KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1100,
      "full": 1650,
      "portion": 1100
    }
  },
  {
    "name": "Beef Palandi Kottu",
    "description": "",
    "price": 1150,
    "category": "PALANDI KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1150,
      "full": 1750,
      "portion": 1150
    }
  },
  {
    "name": "Prawn Palandi Kottu",
    "description": "",
    "price": 1150,
    "category": "PALANDI KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1150,
      "full": 1750,
      "portion": 1150
    }
  },
  {
    "name": "Sea Food Palandi Kottu",
    "description": "",
    "price": 1200,
    "category": "PALANDI KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1200,
      "full": 1850,
      "portion": 1200
    }
  },
  {
    "name": "Mix Palandi Kottu",
    "description": "",
    "price": 1300,
    "category": "PALANDI KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1300,
      "full": 1950,
      "portion": 1300
    }
  },
  {
    "name": "Chicken Dolphin Kottu",
    "description": "",
    "price": 1100,
    "category": "DOLPHIN KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1100,
      "full": 1650,
      "portion": 1100
    }
  },
  {
    "name": "Beef Dolphin Kottu",
    "description": "",
    "price": 1150,
    "category": "DOLPHIN KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1150,
      "full": 1750,
      "portion": 1150
    }
  },
  {
    "name": "Prawn Dolphin Kottu",
    "description": "",
    "price": 1150,
    "category": "DOLPHIN KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1150,
      "full": 1750,
      "portion": 1150
    }
  },
  {
    "name": "Sea Food Dolphin Kottu",
    "description": "",
    "price": 1200,
    "category": "DOLPHIN KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1200,
      "full": 1850,
      "portion": 1200
    }
  },
  {
    "name": "Mix Dolphin Kottu",
    "description": "",
    "price": 1300,
    "category": "DOLPHIN KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1300,
      "full": 1950,
      "portion": 1300
    }
  },
  {
    "name": "Chicken String Hopper Kottu",
    "description": "",
    "price": 800,
    "category": "STRING HOPPER KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 800,
      "full": 1300,
      "portion": 800
    }
  },
  {
    "name": "Beef String Hopper Kottu",
    "description": "",
    "price": 850,
    "category": "STRING HOPPER KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 850,
      "full": 1400,
      "portion": 850
    }
  },
  {
    "name": "Egg String Hopper Kottu",
    "description": "",
    "price": 800,
    "category": "STRING HOPPER KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 800,
      "full": 1250,
      "portion": 800
    }
  },
  {
    "name": "Vegetable String Hopper Kottu",
    "description": "",
    "price": 700,
    "category": "STRING HOPPER KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 700,
      "full": 1200,
      "portion": 700
    }
  },
  {
    "name": "Prawn String Hopper Kottu",
    "description": "",
    "price": 850,
    "category": "STRING HOPPER KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 850,
      "full": 1400,
      "portion": 850
    }
  },
  {
    "name": "Sea Food String Hopper Kottu",
    "description": "",
    "price": 950,
    "category": "STRING HOPPER KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 950,
      "full": 1450,
      "portion": 950
    }
  },
  {
    "name": "Mix String Hopper Kottu",
    "description": "",
    "price": 1050,
    "category": "STRING HOPPER KOTTU",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 1050,
      "full": 1600,
      "portion": 1050
    }
  },
  {
    "name": "Chicken Kottu Rotty",
    "description": "",
    "price": 750,
    "category": "KOTTU ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 750,
      "full": 1250,
      "portion": 750
    }
  },
  {
    "name": "Beef Kottu Rotty",
    "description": "",
    "price": 800,
    "category": "KOTTU ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 800,
      "full": 1350,
      "portion": 800
    }
  },
  {
    "name": "Egg Kottu Rotty",
    "description": "",
    "price": 700,
    "category": "KOTTU ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 700,
      "full": 1200,
      "portion": 700
    }
  },
  {
    "name": "Vegetable Kottu Rotty",
    "description": "",
    "price": 650,
    "category": "KOTTU ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 650,
      "full": 1200,
      "portion": 650
    }
  },
  {
    "name": "Prawn Kottu Rotty",
    "description": "",
    "price": 800,
    "category": "KOTTU ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 800,
      "full": 1350,
      "portion": 800
    }
  },
  {
    "name": "Sea Food Kottu Rotty",
    "description": "",
    "price": 900,
    "category": "KOTTU ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 900,
      "full": 1400,
      "portion": 900
    }
  },
  {
    "name": "Mix Kottu Rotty",
    "description": "",
    "price": 950,
    "category": "KOTTU ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Normal",
      "Full"
    ],
    "portionPrices": {
      "normal": 950,
      "full": 1500,
      "portion": 950
    }
  },
  {
    "name": "Chicken (Portion)",
    "description": "",
    "price": 1500,
    "category": "HAWAIIAN KOTTU (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1500
    }
  },
  {
    "name": "Mix (Portion)",
    "description": "",
    "price": 1800,
    "category": "HAWAIIAN KOTTU (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1800
    }
  },
  {
    "name": "Chicken (Portion)",
    "description": "",
    "price": 1350,
    "category": "PEPPER KOTTU (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1350
    }
  },
  {
    "name": "Beef (Portion)",
    "description": "",
    "price": 1450,
    "category": "PEPPER KOTTU (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1450
    }
  },
  {
    "name": "Mix (Portion)",
    "description": "",
    "price": 1650,
    "category": "PEPPER KOTTU (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1650
    }
  },
  {
    "name": "Chicken Kuruma",
    "description": "",
    "price": 1500,
    "category": "KURUMA",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1500
    }
  },
  {
    "name": "Beef Kuruma",
    "description": "",
    "price": 1600,
    "category": "KURUMA",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1600
    }
  },
  {
    "name": "Mutton Kuruma",
    "description": "",
    "price": 2200,
    "category": "KURUMA",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 2200
    }
  },
  {
    "name": "Chicken Kadai",
    "description": "",
    "price": 1500,
    "category": "KADAI / WHITE KADAI",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1500
    }
  },
  {
    "name": "Beef Kadai",
    "description": "",
    "price": 1600,
    "category": "KADAI / WHITE KADAI",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1600
    }
  },
  {
    "name": "Mutton Kadai",
    "description": "",
    "price": 2200,
    "category": "KADAI / WHITE KADAI",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 2200
    }
  },
  {
    "name": "Chicken Butter Masala",
    "description": "",
    "price": 1500,
    "category": "BUTTER MASALA",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1500
    }
  },
  {
    "name": "Beef Butter Masala",
    "description": "",
    "price": 1600,
    "category": "BUTTER MASALA",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1600
    }
  },
  {
    "name": "Mutton Butter Masala",
    "description": "",
    "price": 2200,
    "category": "BUTTER MASALA",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 2200
    }
  },
  {
    "name": "Plan Parata",
    "description": "",
    "price": 100,
    "category": "PARATA ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 100
    }
  },
  {
    "name": "Ghee Parata",
    "description": "",
    "price": 150,
    "category": "PARATA ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 150
    }
  },
  {
    "name": "Bun Parata",
    "description": "",
    "price": 150,
    "category": "PARATA ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 150
    }
  },
  {
    "name": "Nool Parata",
    "description": "",
    "price": 120,
    "category": "PARATA ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 120
    }
  },
  {
    "name": "Cheese Naan",
    "description": "",
    "price": 280,
    "category": "NAAN ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 280
    }
  },
  {
    "name": "Butter Naan",
    "description": "",
    "price": 250,
    "category": "NAAN ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 250
    }
  },
  {
    "name": "Garlic Naan",
    "description": "",
    "price": 230,
    "category": "NAAN ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 230
    }
  },
  {
    "name": "Plan Naan",
    "description": "",
    "price": 200,
    "category": "NAAN ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 200
    }
  },
  {
    "name": "Naan Family Pack",
    "description": "",
    "price": 7000,
    "category": "NAAN ROTTY",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 7000
    }
  },
  {
    "name": "Chicken (Portion)",
    "description": "",
    "price": 1450,
    "category": "DEVILED (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1450
    }
  },
  {
    "name": "Beef (Portion)",
    "description": "",
    "price": 1600,
    "category": "DEVILED (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1600
    }
  },
  {
    "name": "Prawn (Portion)",
    "description": "",
    "price": 1600,
    "category": "DEVILED (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1600
    }
  },
  {
    "name": "Cuttle Fish (Portion)",
    "description": "",
    "price": 1600,
    "category": "DEVILED (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1600
    }
  },
  {
    "name": "Fish (Portion)",
    "description": "",
    "price": 1600,
    "category": "DEVILED (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 1600
    }
  },
  {
    "name": "Mix (Portion)",
    "description": "",
    "price": 2200,
    "category": "DEVILED (PORTION ONLY)",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Portion"
    ],
    "portionPrices": {
      "portion": 2200
    }
  },
  {
    "name": "BBQ Chicken",
    "description": "",
    "price": 1500,
    "category": "BBQ & TANDOORI",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Half",
      "Full"
    ],
    "portionPrices": {
      "half": 1500,
      "full": 2600
    }
  },
  {
    "name": "Tandoori Chicken",
    "description": "",
    "price": 950,
    "category": "BBQ & TANDOORI",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": true,
    "availablePortions": [
      "Quarter",
      "Half"
    ],
    "portionPrices": {
      "quarter": 950,
      "half": 1700
    }
  },
  {
    "name": "Chicken Kebab",
    "description": "",
    "price": 1450,
    "category": "KEBAB & TIKKA",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1450
    }
  },
  {
    "name": "Chicken Tikka",
    "description": "",
    "price": 1350,
    "category": "KEBAB & TIKKA",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1350
    }
  },
  {
    "name": "Hot Butter Cuttle Fish",
    "description": "",
    "price": 1600,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1600
    }
  },
  {
    "name": "Hot Butter Prawn",
    "description": "",
    "price": 1600,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1600
    }
  },
  {
    "name": "Better Butter Chicken",
    "description": "",
    "price": 2000,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 2000
    }
  },
  {
    "name": "Better Butter Prawn",
    "description": "",
    "price": 2000,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 2000
    }
  },
  {
    "name": "Better Butter Cuttle Fish",
    "description": "",
    "price": 2200,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 2200
    }
  },
  {
    "name": "Singapore Style Chicken",
    "description": "",
    "price": 1800,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1800
    }
  },
  {
    "name": "Singapore Style Prawn",
    "description": "",
    "price": 1800,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1800
    }
  },
  {
    "name": "Singapore Style Crab",
    "description": "",
    "price": 1800,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1800
    }
  },
  {
    "name": "Pepper Style Chicken",
    "description": "",
    "price": 1800,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1800
    }
  },
  {
    "name": "Pepper Style Beef",
    "description": "",
    "price": 2000,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 2000
    }
  },
  {
    "name": "Pepper Style Prawn",
    "description": "",
    "price": 1800,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1800
    }
  },
  {
    "name": "Chopsuey Prawn",
    "description": "",
    "price": 1800,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1800
    }
  },
  {
    "name": "Cashew and Chilli with Prawn",
    "description": "",
    "price": 2000,
    "category": "SIDE DISHES",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 2000
    }
  },
  {
    "name": "Chicken Pasta",
    "description": "",
    "price": 1350,
    "category": "PASTA",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1350
    }
  },
  {
    "name": "Beef Pasta",
    "description": "",
    "price": 1450,
    "category": "PASTA",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1450
    }
  },
  {
    "name": "Mix Pasta",
    "description": "",
    "price": 1550,
    "category": "PASTA",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1550
    }
  },
  {
    "name": "Seafood Pasta",
    "description": "",
    "price": 1550,
    "category": "PASTA",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1550
    }
  },
  {
    "name": "Chicken Mee Goreng",
    "description": "",
    "price": 1350,
    "category": "MEE GORENG",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1350
    }
  },
  {
    "name": "Beef Mee Goreng",
    "description": "",
    "price": 1450,
    "category": "MEE GORENG",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1450
    }
  },
  {
    "name": "Mix Mee Goreng",
    "description": "",
    "price": 1550,
    "category": "MEE GORENG",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1550
    }
  },
  {
    "name": "Seafood Mee Goreng",
    "description": "",
    "price": 1550,
    "category": "MEE GORENG",
    "department": "KITCHEN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 12,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1550
    }
  },
  {
    "name": "Chicken Submarine",
    "description": "",
    "price": 1100,
    "category": "SUBMARINE",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1100
    }
  },
  {
    "name": "Crispy Chicken Submarine",
    "description": "",
    "price": 1200,
    "category": "SUBMARINE",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1200
    }
  },
  {
    "name": "Beef Submarine",
    "description": "",
    "price": 1400,
    "category": "SUBMARINE",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1400
    }
  },
  {
    "name": "Mix Submarine",
    "description": "",
    "price": 1500,
    "category": "SUBMARINE",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1500
    }
  },
  {
    "name": "Chicken Shawarma",
    "description": "",
    "price": 1200,
    "category": "SHAWARMA",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1200
    }
  },
  {
    "name": "Crispy Chicken Shawarma",
    "description": "",
    "price": 1350,
    "category": "SHAWARMA",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1350
    }
  },
  {
    "name": "Beef Shawarma",
    "description": "",
    "price": 1450,
    "category": "SHAWARMA",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1450
    }
  },
  {
    "name": "Mix Shawarma",
    "description": "",
    "price": 1500,
    "category": "SHAWARMA",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1500
    }
  },
  {
    "name": "Chicken Burger",
    "description": "",
    "price": 900,
    "category": "BURGER",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 900
    }
  },
  {
    "name": "Double Chicken Burger",
    "description": "",
    "price": 1200,
    "category": "BURGER",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1200
    }
  },
  {
    "name": "Double Cheese Burger",
    "description": "",
    "price": 1300,
    "category": "BURGER",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1300
    }
  },
  {
    "name": "Crispy Chicken Burger",
    "description": "",
    "price": 1100,
    "category": "BURGER",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1100
    }
  },
  {
    "name": "Beef Burger",
    "description": "",
    "price": 1100,
    "category": "BURGER",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 1100
    }
  },
  {
    "name": "Chicken Sandwich",
    "description": "",
    "price": 850,
    "category": "SANDWICH",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": true,
    "availablePortions": [
      "Without Cheese",
      "With Cheese"
    ],
    "portionPrices": {
      "withoutCheese": 850,
      "withCheese": 950
    }
  },
  {
    "name": "Beef Sandwich",
    "description": "",
    "price": 1050,
    "category": "SANDWICH",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": true,
    "availablePortions": [
      "Without Cheese",
      "With Cheese"
    ],
    "portionPrices": {
      "withoutCheese": 1050,
      "withCheese": 1150
    }
  },
  {
    "name": "Egg Sandwich",
    "description": "",
    "price": 650,
    "category": "SANDWICH",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": true,
    "availablePortions": [
      "Without Cheese",
      "With Cheese"
    ],
    "portionPrices": {
      "withoutCheese": 650,
      "withCheese": 750
    }
  },
  {
    "name": "Vegetable Sandwich",
    "description": "",
    "price": 650,
    "category": "SANDWICH",
    "department": "BUN",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": true,
    "availablePortions": [
      "Without Cheese",
      "With Cheese"
    ],
    "portionPrices": {
      "withoutCheese": 650,
      "withCheese": 750
    }
  },
  {
    "name": "Vanilla Ice Cream",
    "description": "",
    "price": 280,
    "category": "ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 280
    }
  },
  {
    "name": "Chocolate Ice Cream",
    "description": "",
    "price": 280,
    "category": "ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 280
    }
  },
  {
    "name": "Strawberry Ice Cream",
    "description": "",
    "price": 280,
    "category": "ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 280
    }
  },
  {
    "name": "Mango Ice Cream",
    "description": "",
    "price": 280,
    "category": "ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 280
    }
  },
  {
    "name": "Blueberry Ice Cream",
    "description": "",
    "price": 280,
    "category": "ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 280
    }
  },
  {
    "name": "Banana Ice Cream",
    "description": "",
    "price": 280,
    "category": "ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 280
    }
  },
  {
    "name": "Coffee Ice Cream",
    "description": "",
    "price": 280,
    "category": "ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 280
    }
  },
  {
    "name": "Sweet Lessi",
    "description": "",
    "price": 450,
    "category": "LESSI",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Mango Lessi",
    "description": "",
    "price": 500,
    "category": "LESSI",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 500
    }
  },
  {
    "name": "Vanilla Lessi",
    "description": "",
    "price": 500,
    "category": "LESSI",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 500
    }
  },
  {
    "name": "Strawberry Lessi",
    "description": "",
    "price": 500,
    "category": "LESSI",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 500
    }
  },
  {
    "name": "Blueberry Lessi",
    "description": "",
    "price": 500,
    "category": "LESSI",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 500
    }
  },
  {
    "name": "Fruit and Nut Lessi",
    "description": "",
    "price": 550,
    "category": "LESSI",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 550
    }
  },
  {
    "name": "Vanilla Nut Ice Cream",
    "description": "",
    "price": 320,
    "category": "NUTS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 320
    }
  },
  {
    "name": "Chocolate Nut Ice Cream",
    "description": "",
    "price": 320,
    "category": "NUTS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 320
    }
  },
  {
    "name": "Fruit and Nut Ice Cream",
    "description": "",
    "price": 320,
    "category": "NUTS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 320
    }
  },
  {
    "name": "Kithul Nut Ice Cream",
    "description": "",
    "price": 320,
    "category": "NUTS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 320
    }
  },
  {
    "name": "Mango Juice",
    "description": "",
    "price": 400,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 400
    }
  },
  {
    "name": "Orange Juice",
    "description": "",
    "price": 450,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Papaya Juice",
    "description": "",
    "price": 250,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 250
    }
  },
  {
    "name": "Avocado Juice",
    "description": "",
    "price": 350,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 350
    }
  },
  {
    "name": "Pine Apple Juice",
    "description": "",
    "price": 350,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 350
    }
  },
  {
    "name": "Grapes Juice",
    "description": "",
    "price": 450,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Passion Fruit Juice",
    "description": "",
    "price": 300,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 300
    }
  },
  {
    "name": "Apple Juice",
    "description": "",
    "price": 450,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Mixed Fruit Juice",
    "description": "",
    "price": 400,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 400
    }
  },
  {
    "name": "Watermelon Juice",
    "description": "",
    "price": 350,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 350
    }
  },
  {
    "name": "Banana Juice",
    "description": "",
    "price": 250,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 250
    }
  },
  {
    "name": "Nelli Crush",
    "description": "",
    "price": 250,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 250
    }
  },
  {
    "name": "Nannari",
    "description": "",
    "price": 250,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 250
    }
  },
  {
    "name": "Lemon Juice",
    "description": "",
    "price": 250,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 250
    }
  },
  {
    "name": "Lime Juice",
    "description": "",
    "price": 250,
    "category": "FRESH JUICE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 250
    }
  },
  {
    "name": "Badham Kulfi",
    "description": "",
    "price": 350,
    "category": "KULFI",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 350
    }
  },
  {
    "name": "Strawberry Kulfi",
    "description": "",
    "price": 450,
    "category": "KULFI",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Vanilla Milkshake",
    "description": "",
    "price": 450,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Chocolate Milkshake",
    "description": "",
    "price": 450,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Strawberry Milkshake",
    "description": "",
    "price": 450,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Mango Milkshake",
    "description": "",
    "price": 450,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Banana Milkshake",
    "description": "",
    "price": 450,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Blueberry Milkshake",
    "description": "",
    "price": 450,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Ice Coffee",
    "description": "",
    "price": 400,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 400
    }
  },
  {
    "name": "Coffee Shake",
    "description": "",
    "price": 450,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Choco Smoothie",
    "description": "",
    "price": 500,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 500
    }
  },
  {
    "name": "Ice Milo",
    "description": "",
    "price": 500,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 500
    }
  },
  {
    "name": "Date Shake",
    "description": "",
    "price": 500,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 500
    }
  },
  {
    "name": "Badham Milk",
    "description": "",
    "price": 500,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 500
    }
  },
  {
    "name": "Fruit and Nuts Shake",
    "description": "",
    "price": 500,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 500
    }
  },
  {
    "name": "Kit kat Shake",
    "description": "",
    "price": 600,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 600
    }
  },
  {
    "name": "Snikers Shake",
    "description": "",
    "price": 600,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 600
    }
  },
  {
    "name": "Vanilla Smoothie",
    "description": "",
    "price": 500,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 500
    }
  },
  {
    "name": "Oreo Shake",
    "description": "",
    "price": 600,
    "category": "MILKSHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 600
    }
  },
  {
    "name": "Kids Vanilla",
    "description": "",
    "price": 180,
    "category": "KIDS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 180
    }
  },
  {
    "name": "Kids Chocolate",
    "description": "",
    "price": 180,
    "category": "KIDS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 180
    }
  },
  {
    "name": "Kids Strawberry",
    "description": "",
    "price": 180,
    "category": "KIDS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 180
    }
  },
  {
    "name": "Kids Mango",
    "description": "",
    "price": 180,
    "category": "KIDS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 180
    }
  },
  {
    "name": "Kids Blueberry",
    "description": "",
    "price": 180,
    "category": "KIDS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 180
    }
  },
  {
    "name": "Kids Banana",
    "description": "",
    "price": 180,
    "category": "KIDS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 180
    }
  },
  {
    "name": "Kids Fruit and Nut",
    "description": "",
    "price": 220,
    "category": "KIDS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 220
    }
  },
  {
    "name": "Kids Chocolate Nut",
    "description": "",
    "price": 220,
    "category": "KIDS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 220
    }
  },
  {
    "name": "Kids Vanilla Nut",
    "description": "",
    "price": 220,
    "category": "KIDS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 220
    }
  },
  {
    "name": "Kids Kithul Nut",
    "description": "",
    "price": 220,
    "category": "KIDS ICE CREAM",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 220
    }
  },
  {
    "name": "Strawberry Mojito",
    "description": "",
    "price": 600,
    "category": "MOJITO",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 600
    }
  },
  {
    "name": "Black Currant Mojito",
    "description": "",
    "price": 600,
    "category": "MOJITO",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 600
    }
  },
  {
    "name": "Blue Ocean Mojito",
    "description": "",
    "price": 600,
    "category": "MOJITO",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 600
    }
  },
  {
    "name": "Apple Mojito",
    "description": "",
    "price": 600,
    "category": "MOJITO",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 600
    }
  },
  {
    "name": "Pomegranate Mojito",
    "description": "",
    "price": 600,
    "category": "MOJITO",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 600
    }
  },
  {
    "name": "Ice Talk Special",
    "description": "",
    "price": 400,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 400
    }
  },
  {
    "name": "Ice Talk Special Nuts",
    "description": "",
    "price": 450,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Jelly Ice Cream",
    "description": "",
    "price": 350,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 350
    }
  },
  {
    "name": "Banana Flick Flack",
    "description": "",
    "price": 350,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 350
    }
  },
  {
    "name": "Banana Boat",
    "description": "",
    "price": 450,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 450
    }
  },
  {
    "name": "Mixed Ice Cream",
    "description": "",
    "price": 350,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 350
    }
  },
  {
    "name": "Fruit Salad",
    "description": "",
    "price": 550,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 550
    }
  },
  {
    "name": "Fruit Salad with Ice Cream",
    "description": "",
    "price": 650,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 650
    }
  },
  {
    "name": "Royal Faluda",
    "description": "",
    "price": 500,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 500
    }
  },
  {
    "name": "Faluda with Ice Cream",
    "description": "",
    "price": 350,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 350
    }
  },
  {
    "name": "Jumbo Mix",
    "description": "",
    "price": 650,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 650
    }
  },
  {
    "name": "Boondhi Ice Cream",
    "description": "",
    "price": 350,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 350
    }
  },
  {
    "name": "Puttu Ice Cream",
    "description": "",
    "price": 750,
    "category": "COOL TREATS SPECIAL",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 750
    }
  },
  {
    "name": "Special Vanilla Shake",
    "description": "",
    "price": 750,
    "category": "SPECIAL MILK SHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 750
    }
  },
  {
    "name": "Special Strawberry Shake",
    "description": "",
    "price": 750,
    "category": "SPECIAL MILK SHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 750
    }
  },
  {
    "name": "Special Chocolate Shake",
    "description": "",
    "price": 750,
    "category": "SPECIAL MILK SHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 750
    }
  },
  {
    "name": "Special Icemilo Shake",
    "description": "",
    "price": 780,
    "category": "SPECIAL MILK SHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 780
    }
  },
  {
    "name": "Special Oreo Shake",
    "description": "",
    "price": 780,
    "category": "SPECIAL MILK SHAKE",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 780
    }
  },
  {
    "name": "Bubble Tea (Chocolate, Strawberry, Blueberry, Mango)",
    "description": "",
    "price": 900,
    "category": "BUBBLE TEA",
    "department": "JUICE",
    "isAvailable": true,
    "isPopular": false,
    "prepTimeMinutes": 5,
    "hasPortions": false,
    "availablePortions": [
      "Standard"
    ],
    "portionPrices": {
      "portion": 900
    }
  }
];

module.exports = {
  defaultCategories,
  defaultMenuItems,
};
