/**
 * Local Storage Service for 'dsuper' (SuperADMIN demo account).
 *
 * All demo sales, orders, expenses, and report analytics created or viewed
 * by dsuper are persisted strictly in browser localStorage.
 * This guarantees zero pollution of the live MongoDB Atlas database.
 */

const STORAGE_KEYS = {
  SALES: 'icetalk_dsuper_sales',
  ORDERS: 'icetalk_dsuper_orders',
  EXPENSES: 'icetalk_dsuper_expenses',
  SEQ: 'icetalk_dsuper_seq',
};

// Default master catalog fallback if server is offline
export const DEFAULT_TABLES = [
  { _id: 'tbl_f1', name: 'Family 01', capacity: 4, type: 'Family', sortOrder: 1 },
  { _id: 'tbl_f2', name: 'Family 02', capacity: 4, type: 'Family', sortOrder: 2 },
  { _id: 'tbl_f3', name: 'Family 03', capacity: 6, type: 'Family', sortOrder: 3 },
  { _id: 'tbl_f4', name: 'Family 04', capacity: 6, type: 'Family', sortOrder: 4 },
  { _id: 'tbl_v1', name: 'VIP 01', capacity: 8, type: 'VIP', sortOrder: 5 },
  { _id: 'tbl_v2', name: 'VIP 02', capacity: 8, type: 'VIP', sortOrder: 6 },
  { _id: 'tbl_c1', name: 'Couple 01', capacity: 2, type: 'Couple', sortOrder: 7 },
  { _id: 'tbl_c2', name: 'Couple 02', capacity: 2, type: 'Couple', sortOrder: 8 },
  { _id: 'tbl_o1', name: 'Outdoor A', capacity: 4, type: 'Outdoor', sortOrder: 9 },
  { _id: 'tbl_o2', name: 'Outdoor B', capacity: 4, type: 'Outdoor', sortOrder: 10 },
];

export const DEFAULT_MENU_ITEMS = [
  { _id: 'm1', name: 'Chicken Kottu', price: 850, category: 'Kottu', department: 'KITCHEN', isAvailable: true, isPopular: true },
  { _id: 'm2', name: 'Cheese Chicken Kottu', price: 1150, category: 'Kottu', department: 'KITCHEN', isAvailable: true, isPopular: true },
  { _id: 'm3', name: 'Beef Kottu', price: 950, category: 'Kottu', department: 'KITCHEN', isAvailable: true },
  { _id: 'm4', name: 'Special Mixed Fried Rice', price: 1100, category: 'Rice', department: 'KITCHEN', isAvailable: true, isPopular: true },
  { _id: 'm5', name: 'Chicken Fried Rice', price: 900, category: 'Rice', department: 'KITCHEN', isAvailable: true, isPopular: true },
  { _id: 'm6', name: 'Seafood Nasi Goreng', price: 1350, category: 'Rice', department: 'KITCHEN', isAvailable: true },
  { _id: 'm7', name: 'Crispy Chicken Burger', price: 750, category: 'Burgers', department: 'KITCHEN', isAvailable: true },
  { _id: 'm8', name: 'Chicken Bun', price: 450, category: 'Buns', department: 'BUN', isAvailable: true, isPopular: true },
  { _id: 'm9', name: 'Fish Bun', price: 350, category: 'Buns', department: 'BUN', isAvailable: true },
  { _id: 'm10', name: 'Chicken Roll', price: 180, category: 'Short Eats', department: 'BUN', isAvailable: true },
  { _id: 'm11', name: 'Vegetable Samosa (3 pcs)', price: 250, category: 'Short Eats', department: 'BUN', isAvailable: true },
  { _id: 'm12', name: 'Mango Juice', price: 450, category: 'Juice', department: 'JUICE', isAvailable: true, isPopular: true },
  { _id: 'm13', name: 'Fresh Orange Juice', price: 500, category: 'Juice', department: 'JUICE', isAvailable: true },
  { _id: 'm14', name: 'Avocado Shake', price: 600, category: 'Milkshakes', department: 'JUICE', isAvailable: true, isPopular: true },
  { _id: 'm15', name: 'Chocolate Milkshake', price: 550, category: 'Milkshakes', department: 'JUICE', isAvailable: true },
  { _id: 'm16', name: 'Royal Ice Talk Falooda', price: 650, category: 'Falooda', department: 'JUICE', isAvailable: true, isPopular: true },
  { _id: 'm17', name: 'Special Sundae Ice Cream', price: 550, category: 'Ice Cream', department: 'JUICE', isAvailable: true },
  { _id: 'm18', name: 'Mineral Water (1.5L)', price: 150, category: 'Other', department: 'OTHER', isAvailable: true },
];

export const isDsuperUser = () => {
  try {
    const userStr = localStorage.getItem('icetalk_user');
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    return user?.username === 'dsuper' || Boolean(user?.isDemo);
  } catch {
    return false;
  }
};

export const getDsuperSales = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveDsuperSales = (sales) => {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
};

export const getDsuperOrders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveDsuperOrders = (orders) => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const getDsuperExpenses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveDsuperExpenses = (expenses) => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

const getDsuperSeq = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEQ);
    return raw ? JSON.parse(raw) : { orderNum: 9101, saleNum: 501 };
  } catch {
    return { orderNum: 9101, saleNum: 501 };
  }
};

const saveDsuperSeq = (seq) => {
  localStorage.setItem(STORAGE_KEYS.SEQ, JSON.stringify(seq));
};

/**
 * Generate initial realistic sales strictly within LKR 200,000 for today,
 * plus several days of this month so reports and P&L statements look complete immediately.
 */
export const initDsuperStorageIfNeeded = () => {
  const existingSales = getDsuperSales();
  if (existingSales && existingSales.length > 0) {
    return;
  }

  const generatedSales = [];
  const generatedOrders = [];
  let seqOrderNum = 9001;
  let seqSaleNum = 201;

  const sampleCombos = [
    [
      { name: 'Special Mixed Fried Rice', quantity: 2, price: 1100, department: 'KITCHEN' },
      { name: 'Mango Juice', quantity: 2, price: 450, department: 'JUICE' },
      { name: 'Chicken Bun', quantity: 2, price: 450, department: 'BUN' },
    ],
    [
      { name: 'Cheese Chicken Kottu', quantity: 2, price: 1150, department: 'KITCHEN' },
      { name: 'Royal Ice Talk Falooda', quantity: 2, price: 650, department: 'JUICE' },
      { name: 'Mineral Water (1.5L)', quantity: 1, price: 150, department: 'OTHER' },
    ],
    [
      { name: 'Chicken Fried Rice', quantity: 3, price: 900, department: 'KITCHEN' },
      { name: 'Chocolate Milkshake', quantity: 3, price: 550, department: 'JUICE' },
      { name: 'Chicken Roll', quantity: 3, price: 180, department: 'BUN' },
    ],
    [
      { name: 'Crispy Chicken Burger', quantity: 2, price: 750, department: 'KITCHEN' },
      { name: 'Fresh Orange Juice', quantity: 2, price: 500, department: 'JUICE' },
      { name: 'Special Sundae Ice Cream', quantity: 1, price: 550, department: 'JUICE' },
    ],
    [
      { name: 'Seafood Nasi Goreng', quantity: 2, price: 1350, department: 'KITCHEN' },
      { name: 'Avocado Shake', quantity: 2, price: 600, department: 'JUICE' },
    ],
    [
      { name: 'Chicken Kottu', quantity: 3, price: 850, department: 'KITCHEN' },
      { name: 'Mango Juice', quantity: 3, price: 450, department: 'JUICE' },
      { name: 'Vegetable Samosa (3 pcs)', quantity: 2, price: 250, department: 'BUN' },
    ],
    [
      { name: 'Special Mixed Fried Rice', quantity: 4, price: 1100, department: 'KITCHEN' },
      { name: 'Chicken Kottu', quantity: 2, price: 850, department: 'KITCHEN' },
      { name: 'Royal Ice Talk Falooda', quantity: 4, price: 650, department: 'JUICE' },
    ],
    [
      { name: 'Beef Kottu', quantity: 2, price: 950, department: 'KITCHEN' },
      { name: 'Lime Juice with Mint', quantity: 2, price: 350, department: 'JUICE' },
    ],
    [
      { name: 'Chicken Bun', quantity: 4, price: 450, department: 'BUN' },
      { name: 'Fish Bun', quantity: 2, price: 350, department: 'BUN' },
      { name: 'Avocado Shake', quantity: 2, price: 600, department: 'JUICE' },
    ],
  ];

  const now = new Date();

  // Helper to build a sale record
  const makeSale = (itemsList, dateObj, table, paymentMethod, orderType = 'DINE_IN') => {
    const subtotal = itemsList.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const orderNumber = seqOrderNum++;
    const saleId = 'ds_sale_' + seqSaleNum;
    const orderId = 'ds_ord_' + orderNumber;

    const sale = {
      _id: saleId,
      saleNumber: `INV-D${String(seqSaleNum++).padStart(5, '0')}`,
      tableId: table ? table._id : null,
      tableNameSnapshot: table ? table.name : (orderType === 'TAKEAWAY' ? 'Takeaway' : 'Delivery'),
      orderType,
      orderNumbers: [orderNumber],
      items: itemsList.map((it) => ({
        ...it,
        total: it.price * it.quantity,
        specialInstructions: '',
        noteAmount: 0,
      })),
      subtotal,
      discount: 0,
      discountPercentage: 0,
      tax: 0,
      specialNotesTotal: 0,
      total: subtotal,
      paymentMethod,
      paymentStatus: 'PAID',
      amountTendered: subtotal,
      changeAmount: 0,
      cashierNameSnapshot: 'SuperADMIN',
      isDemo: true,
      createdAt: dateObj.toISOString(),
      updatedAt: dateObj.toISOString(),
    };

    const order = {
      _id: orderId,
      orderNumber,
      tableId: table ? table._id : null,
      tableName: sale.tableNameSnapshot,
      orderType,
      customerName: orderType !== 'DINE_IN' ? 'Guest Customer' : '',
      customerPhone: '',
      status: 'COMPLETED',
      isSettled: true,
      items: sale.items,
      subtotal,
      total: subtotal,
      specialInstructions: '',
      priority: 'NORMAL',
      isDemo: true,
      createdAt: new Date(dateObj.getTime() - 25 * 60000).toISOString(),
      updatedAt: dateObj.toISOString(),
    };

    generatedSales.push(sale);
    generatedOrders.push(order);
  };

  const paymentCycle = ['CASH', 'CASH', 'CARD', 'CASH', 'CARD', 'ONLINE'];
  const channelCycle = ['DINE_IN', 'DINE_IN', 'TAKEAWAY', 'DINE_IN', 'DINE_IN', 'DELIVERY'];

  // 1. TODAY'S SALES: Total around LKR 145,000 - 165,000 (well within LKR 200,000)
  // Let's create ~28 orders spread across hours from 10:00 to 22:00
  let todayRunningTotal = 0;
  for (let i = 0; i < 28; i++) {
    const combo = sampleCombos[i % sampleCombos.length];
    const comboSubtotal = combo.reduce((sum, it) => sum + it.price * it.quantity, 0);

    // Keep daily sum within LKR 200,000
    if (todayRunningTotal + comboSubtotal > 175000) break;

    const hour = 10 + Math.floor((i / 28) * 11); // between 10am and 9pm
    const minute = (i * 19) % 60;
    const saleTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

    const tbl = DEFAULT_TABLES[i % DEFAULT_TABLES.length];
    const pMethod = paymentCycle[i % paymentCycle.length];
    const cType = channelCycle[i % channelCycle.length];

    makeSale(combo, saleTime, cType === 'DINE_IN' ? tbl : null, pMethod, cType);
    todayRunningTotal += comboSubtotal;
  }

  // 2. YESTERDAY'S SALES (for day-to-day comparison and monthly reports)
  for (let i = 0; i < 24; i++) {
    const combo = sampleCombos[(i + 2) % sampleCombos.length];
    const hour = 11 + Math.floor((i / 24) * 10);
    const minute = (i * 23) % 60;
    const saleTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, hour, minute, 0);

    const tbl = DEFAULT_TABLES[(i + 3) % DEFAULT_TABLES.length];
    const pMethod = paymentCycle[(i + 1) % paymentCycle.length];
    const cType = channelCycle[(i + 2) % channelCycle.length];

    makeSale(combo, saleTime, cType === 'DINE_IN' ? tbl : null, pMethod, cType);
  }

  // 3. 3-5 DAYS AGO SALES (so This Week and This Month have rich analytics)
  for (let d = 2; d <= 4; d++) {
    for (let i = 0; i < 18; i++) {
      const combo = sampleCombos[(i + d) % sampleCombos.length];
      const hour = 11 + Math.floor((i / 18) * 10);
      const minute = (i * 17) % 60;
      const saleTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d, hour, minute, 0);

      const tbl = DEFAULT_TABLES[(i + d) % DEFAULT_TABLES.length];
      const pMethod = paymentCycle[i % paymentCycle.length];
      makeSale(combo, saleTime, tbl, pMethod, 'DINE_IN');
    }
  }

  // 4. Initial Sample Expenses for This Month
  const sampleExpenses = [
    {
      _id: 'ds_exp_1',
      title: 'Head Chef & Kitchen Team Salary (Mid-Month)',
      category: 'SALARY',
      amount: 65000,
      date: new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 2)).toISOString(),
      paymentMethod: 'CASH',
      recipient: 'Kamal Perera (Head Chef)',
      recordedByName: 'SuperADMIN',
      description: 'Kitchen department payroll distribution',
      receiptRef: 'SAL-OCT-01',
      isDemo: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'ds_exp_2',
      title: 'Service & Waiter Staff Salary Advance',
      category: 'SALARY',
      amount: 35000,
      date: new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 3)).toISOString(),
      paymentMethod: 'CASH',
      recipient: 'Ahmed & Floor Waiters',
      recordedByName: 'SuperADMIN',
      description: 'Advance salary for floor crew',
      receiptRef: 'SAL-OCT-02',
      isDemo: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'ds_exp_3',
      title: 'Fresh Vegetables & Provisions Delivery',
      category: 'RAW_MATERIALS',
      amount: 18500,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
      paymentMethod: 'CASH',
      recipient: 'Colombo Central Wholesale Market',
      recordedByName: 'SuperADMIN',
      description: 'Daily fresh bell peppers, onions, tomatoes, and herbs',
      receiptRef: 'REC-9014',
      isDemo: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'ds_exp_4',
      title: 'Fresh Chicken & Meat Provisions',
      category: 'RAW_MATERIALS',
      amount: 24500,
      date: new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 1)).toISOString(),
      paymentMethod: 'CASH',
      recipient: 'Bairaha Poultry Supply',
      recordedByName: 'SuperADMIN',
      description: 'Halal fresh chicken breasts & kottu meat',
      receiptRef: 'REC-9022',
      isDemo: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'ds_exp_5',
      title: 'Electricity & Power Bill',
      category: 'UTILITIES',
      amount: 22000,
      date: new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 4)).toISOString(),
      paymentMethod: 'ONLINE',
      recipient: 'Ceylon Electricity Board (CEB)',
      recordedByName: 'SuperADMIN',
      description: 'Commercial power supply for chillers & kitchen',
      receiptRef: 'CEB-883921',
      isDemo: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'ds_exp_6',
      title: 'Commercial Cooking Gas Refill (3 Cylinders)',
      category: 'MAINTENANCE',
      amount: 12900,
      date: new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 2)).toISOString(),
      paymentMethod: 'CASH',
      recipient: 'Litro Gas Dealer',
      recordedByName: 'SuperADMIN',
      description: '37.5kg commercial cylinders',
      receiptRef: 'GAS-4902',
      isDemo: true,
      createdAt: new Date().toISOString(),
    },
  ];

  saveDsuperSales(generatedSales);
  saveDsuperOrders(generatedOrders);
  saveDsuperExpenses(sampleExpenses);
  saveDsuperSeq({ orderNum: seqOrderNum + 10, saleNum: seqSaleNum + 5 });

  console.log(
    `[DsuperStorage] Initialized isolated local storage demo data: ${generatedSales.length} sales, ${sampleExpenses.length} expenses. Today running total: LKR ${todayRunningTotal.toLocaleString()}`
  );
};

// Date filter helper
const matchesTimeframe = (dateStr, timeframe, startDate, endDate) => {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (timeframe) {
    case 'today':
      return d >= startOfToday;
    case 'yesterday': {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      return d >= startOfYesterday && d < startOfToday;
    }
    case 'week':
    case 'thisWeek': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff);
      return d >= startOfWeek;
    }
    case 'month':
    case 'thisMonth': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return d >= startOfMonth;
    }
    case 'lastMonth': {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    }
    case 'year':
    case 'thisYear': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return d >= startOfYear;
    }
    case 'custom': {
      if (startDate && d < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    }
    default:
      return true;
  }
};

/**
 * Handle API requests for dsuper directly using localStorage.
 */
export const handleDsuperRequest = async (config) => {
  initDsuperStorageIfNeeded();

  const url = (config.url || '').split('?')[0];
  const method = (config.method || 'GET').toUpperCase();
  const params = config.params || {};

  // Parse body if JSON string
  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      body = {};
    }
  }

  // 1. DASHBOARD METRICS: GET /api/reports/dashboard
  if (url === '/api/reports/dashboard' && method === 'GET') {
    const sales = getDsuperSales();
    const orders = getDsuperOrders();
    const expenses = getDsuperExpenses();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todaySalesList = sales.filter((s) => new Date(s.createdAt) >= startOfToday);
    const todaySales = todaySalesList.reduce((sum, s) => sum + s.total, 0);
    const todaySalesCount = todaySalesList.length;

    const cashSales = todaySalesList.filter((s) => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.total, 0);
    const cardSales = todaySalesList.filter((s) => s.paymentMethod === 'CARD').reduce((sum, s) => sum + s.total, 0);
    const onlineSales = todaySalesList.filter((s) => s.paymentMethod === 'ONLINE').reduce((sum, s) => sum + s.total, 0);

    const todayExpensesList = expenses.filter((e) => new Date(e.date) >= startOfToday);
    const todayExpenses = todayExpensesList.reduce((sum, e) => sum + Number(e.amount), 0);

    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= startOfToday);
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
    const approvedOrders = orders.filter((o) => o.status === 'APPROVED').length;
    const preparingOrders = orders.filter((o) => o.status === 'PREPARING').length;
    const readyOrders = orders.filter((o) => o.status === 'READY').length;
    const completedTodayOrders = todayOrders.filter((o) => o.status === 'COMPLETED').length;
    const cancelledTodayOrders = todayOrders.filter((o) => o.status === 'CANCELLED').length;
    const rejectedTodayOrders = todayOrders.filter((o) => o.status === 'REJECTED').length;

    // Top Items sold today
    const itemMap = {};
    todaySalesList.forEach((s) => {
      (s.items || []).forEach((it) => {
        if (!itemMap[it.name]) {
          itemMap[it.name] = { name: it.name, quantity: 0, revenue: 0, department: it.department || 'KITCHEN' };
        }
        itemMap[it.name].quantity += it.quantity;
        itemMap[it.name].revenue += it.total || it.price * it.quantity;
      });
    });
    const topItems = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((it) => ({
        _id: it.name,
        totalQty: it.quantity,
        totalQuantity: it.quantity,
        totalRevenue: it.revenue,
        department: it.department,
      }));

    // Occupied tables
    const occupiedTableIds = new Set(
      orders.filter((o) => o.tableId && !o.isSettled && !['CANCELLED', 'REJECTED'].includes(o.status)).map((o) => o.tableId)
    );
    const totalTables = DEFAULT_TABLES.length;
    const occupied = occupiedTableIds.size;

    return {
      success: true,
      today: {
        totalSales: todaySales,
        salesCount: todaySalesCount,
        totalOrders: todayOrders.length,
        cashSales,
        cardSales,
        onlineSales,
        totalExpenses: todayExpenses,
        netIncome: todaySales - todayExpenses,
      },
      orderStatusCounts: {
        pending: pendingOrders,
        approved: approvedOrders,
        preparing: preparingOrders,
        ready: readyOrders,
        completed: completedTodayOrders,
        cancelled: cancelledTodayOrders,
        rejected: rejectedTodayOrders,
      },
      tables: {
        total: totalTables,
        occupied,
        available: Math.max(0, totalTables - occupied),
      },
      recentOrders: orders.slice(0, 6).map((o) => ({
        ...o,
        tableNameSnapshot: o.tableNameSnapshot || o.tableName || 'Dine-In',
        waiterNameSnapshot: o.waiterNameSnapshot || 'Waiter',
      })),
      topItems,
    };
  }

  // 2. SALES LEDGER: GET /api/pos/sales
  if (url === '/api/pos/sales' && method === 'GET') {
    const sales = getDsuperSales();
    const timeframe = params.timeframe || 'today';
    const paymentMethod = params.paymentMethod || 'ALL';
    const search = (params.search || '').toLowerCase().trim();

    let filtered = sales.filter((s) =>
      matchesTimeframe(s.createdAt, timeframe, params.startDate, params.endDate)
    );

    if (paymentMethod && paymentMethod !== 'ALL') {
      filtered = filtered.filter((s) => s.paymentMethod === paymentMethod);
    }

    if (search) {
      filtered = filtered.filter(
        (s) =>
          (s.saleNumber && s.saleNumber.toLowerCase().includes(search)) ||
          (s.tableNameSnapshot && s.tableNameSnapshot.toLowerCase().includes(search)) ||
          (s.orderNumbers && s.orderNumbers.some((n) => String(n).includes(search)))
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const limit = Number(params.limit) || 250;
    return {
      success: true,
      sales: filtered.slice(0, limit),
      count: filtered.length,
    };
  }

  // 3. DELETE SALE: DELETE /api/pos/sales/:id
  if (url.startsWith('/api/pos/sales/') && method === 'DELETE') {
    const id = url.replace('/api/pos/sales/', '');
    let sales = getDsuperSales();
    sales = sales.filter((s) => s._id !== id);
    saveDsuperSales(sales);
    return { success: true, message: 'Sale deleted successfully (Local Storage)' };
  }

  // 4. PROFIT & LOSS REPORT: GET /api/reports/profit-loss
  if (url === '/api/reports/profit-loss' && method === 'GET') {
    const sales = getDsuperSales();
    const expenses = getDsuperExpenses();
    const timeframe = params.timeframe || 'thisMonth';

    const filteredSales = sales.filter((s) =>
      matchesTimeframe(s.createdAt, timeframe, params.startDate, params.endDate)
    );
    const filteredExpenses = expenses.filter((e) =>
      matchesTimeframe(e.date, timeframe, params.startDate, params.endDate)
    );

    const grossSales = filteredSales.reduce((sum, s) => sum + (s.subtotal || s.total), 0);
    const totalDiscount = filteredSales.reduce((sum, s) => sum + (s.discount || 0), 0);
    const totalTax = filteredSales.reduce((sum, s) => sum + (s.tax || 0), 0);
    const netSales = filteredSales.reduce((sum, s) => sum + s.total, 0);

    const cashSales = filteredSales.filter((s) => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.total, 0);
    const cardSales = filteredSales.filter((s) => s.paymentMethod === 'CARD').reduce((sum, s) => sum + s.total, 0);
    const onlineSales = filteredSales.filter((s) => s.paymentMethod === 'ONLINE').reduce((sum, s) => sum + s.total, 0);

    const expenseCategories = {
      SALARY: 0,
      RAW_MATERIALS: 0,
      UTILITIES: 0,
      RENT: 0,
      MAINTENANCE: 0,
      MARKETING: 0,
      OTHER: 0,
    };

    let totalExpenses = 0;
    let salaryExpenses = 0;
    let operatingExpenses = 0;

    filteredExpenses.forEach((e) => {
      const amt = Number(e.amount) || 0;
      totalExpenses += amt;
      const cat = e.category || 'OTHER';
      expenseCategories[cat] = (expenseCategories[cat] || 0) + amt;
      if (cat === 'SALARY') {
        salaryExpenses += amt;
      } else {
        operatingExpenses += amt;
      }
    });

    const categoryList = Object.entries(expenseCategories)
      .map(([k, v]) => ({ _id: k, totalAmount: v }))
      .filter((c) => c.totalAmount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount);

    const netProfit = netSales - totalExpenses;
    const profitMargin = netSales > 0 ? (netProfit / netSales) * 100 : 0;

    return {
      success: true,
      timeframe,
      revenue: {
        grossSales,
        discounts: totalDiscount,
        taxes: totalTax,
        netSales,
        transactionsCount: filteredSales.length,
        paymentBreakdown: {
          cash: cashSales,
          card: cardSales,
          online: onlineSales,
        },
      },
      expenses: {
        total: totalExpenses,
        salary: salaryExpenses,
        operating: operatingExpenses,
        byCategory: expenseCategories,
        categoryList,
        recentExpenses: filteredExpenses.slice(0, 50),
      },
      netProfit,
      profitMargin: Number(profitMargin.toFixed(2)),
      isProfitable: netProfit >= 0,
    };
  }

  // 5. DETAILED ANALYTICS REPORT: GET /api/reports/analytics or /api/reports/detailed
  if ((url === '/api/reports/analytics' || url === '/api/reports/detailed') && method === 'GET') {
    const sales = getDsuperSales();
    const timeframe = params.timeframe || 'week';
    const filtered = sales.filter((s) =>
      matchesTimeframe(s.createdAt, timeframe, params.startDate, params.endDate)
    );

    const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);
    const totalSubtotal = filtered.reduce((sum, s) => sum + (s.subtotal || s.total), 0);
    const totalDiscount = filtered.reduce((sum, s) => sum + (s.discount || 0), 0);
    const totalTax = filtered.reduce((sum, s) => sum + (s.tax || 0), 0);

    return {
      success: true,
      timeframe,
      totalRevenue,
      totalSubtotal,
      totalDiscount,
      totalTax,
      totalSalesCount: filtered.length,
      paymentBreakdown: {
        CASH: filtered.filter((s) => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.total, 0),
        CARD: filtered.filter((s) => s.paymentMethod === 'CARD').reduce((sum, s) => sum + s.total, 0),
        ONLINE: filtered.filter((s) => s.paymentMethod === 'ONLINE').reduce((sum, s) => sum + s.total, 0),
      },
      orderTypeBreakdown: {
        DINE_IN: filtered.filter((s) => s.orderType === 'DINE_IN').reduce((sum, s) => sum + s.total, 0),
        TAKEAWAY: filtered.filter((s) => s.orderType === 'TAKEAWAY').reduce((sum, s) => sum + s.total, 0),
        DELIVERY: filtered.filter((s) => s.orderType === 'DELIVERY').reduce((sum, s) => sum + s.total, 0),
      },
      sales: filtered,
    };
  }

  // 6. EXPENSES LIST: GET /api/expenses
  if (url === '/api/expenses' && method === 'GET') {
    const expenses = getDsuperExpenses();
    const timeframe = params.timeframe || 'thisMonth';
    const category = params.category || 'ALL';
    const search = (params.search || '').toLowerCase().trim();

    let filtered = expenses.filter((e) =>
      matchesTimeframe(e.date, timeframe, params.startDate, params.endDate)
    );

    if (category && category !== 'ALL') {
      filtered = filtered.filter((e) => e.category === category);
    }

    if (search) {
      filtered = filtered.filter(
        (e) =>
          (e.title && e.title.toLowerCase().includes(search)) ||
          (e.recipient && e.recipient.toLowerCase().includes(search)) ||
          (e.receiptRef && e.receiptRef.toLowerCase().includes(search))
      );
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    let totalAmount = 0;
    let salaryTotal = 0;
    let otherExpensesTotal = 0;

    filtered.forEach((e) => {
      const amt = Number(e.amount) || 0;
      totalAmount += amt;
      if (e.category === 'SALARY') {
        salaryTotal += amt;
      } else {
        otherExpensesTotal += amt;
      }
    });

    return {
      success: true,
      data: filtered,
      count: filtered.length,
      summary: {
        totalAmount,
        salaryTotal,
        otherExpensesTotal,
        count: filtered.length,
      },
    };
  }

  // 7. CREATE EXPENSE: POST /api/expenses
  if (url === '/api/expenses' && method === 'POST') {
    const expenses = getDsuperExpenses();
    const newExp = {
      _id: 'ds_exp_' + Date.now(),
      title: body.title,
      category: body.category || 'OTHER',
      amount: Number(body.amount) || 0,
      date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
      paymentMethod: body.paymentMethod || 'CASH',
      recipient: body.recipient || '',
      recordedByName: 'SuperADMIN',
      description: body.description || '',
      receiptRef: body.receiptRef || '',
      isDemo: true,
      createdAt: new Date().toISOString(),
    };
    expenses.unshift(newExp);
    saveDsuperExpenses(expenses);
    return { success: true, data: newExp };
  }

  // 8. UPDATE EXPENSE: PUT /api/expenses/:id
  if (url.startsWith('/api/expenses/') && method === 'PUT') {
    const id = url.replace('/api/expenses/', '');
    let expenses = getDsuperExpenses();
    const idx = expenses.findIndex((e) => e._id === id);
    if (idx >= 0) {
      expenses[idx] = {
        ...expenses[idx],
        ...body,
        amount: Number(body.amount !== undefined ? body.amount : expenses[idx].amount),
      };
      saveDsuperExpenses(expenses);
      return { success: true, data: expenses[idx] };
    }
    return { success: false, message: 'Expense not found' };
  }

  // 9. DELETE EXPENSE: DELETE /api/expenses/:id
  if (url.startsWith('/api/expenses/') && method === 'DELETE') {
    const id = url.replace('/api/expenses/', '');
    let expenses = getDsuperExpenses();
    expenses = expenses.filter((e) => e._id !== id);
    saveDsuperExpenses(expenses);
    return { success: true, message: 'Expense deleted successfully' };
  }

  // 10. GET TABLE ACTIVE ORDERS: GET /api/pos/table/:id/orders
  if (url.includes('/api/pos/table/') && url.endsWith('/orders') && method === 'GET') {
    const tableId = url.split('/api/pos/table/')[1].split('/orders')[0];
    const orders = getDsuperOrders();
    const active = orders.filter(
      (o) => String(o.tableId) === String(tableId) && !o.isSettled && !['CANCELLED', 'REJECTED'].includes(o.status)
    );
    const totalAmount = active.reduce((sum, o) => sum + (o.total || 0), 0);
    const subtotal = active.reduce((sum, o) => sum + (o.subtotal || o.total || 0), 0);

    const defaultTbl = DEFAULT_TABLES.find((t) => String(t._id) === String(tableId));
    const tableName = active[0]?.tableName || defaultTbl?.name || `Table ${tableId}`;
    const table = defaultTbl ? { ...defaultTbl, name: tableName } : { _id: tableId, name: tableName };

    const aggregatedItems = [];
    active.forEach((order) => {
      (order.items || []).forEach((item) => {
        aggregatedItems.push({
          orderNumber: order.orderNumber,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total || (item.price * item.quantity),
          department: item.department || 'KITCHEN',
          specialInstructions: item.specialInstructions || '',
        });
      });
    });

    return {
      success: true,
      table,
      ordersCount: active.length,
      orders: active,
      aggregatedItems,
      subtotal,
      total: totalAmount,
      totalAmount,
      activeCount: active.length,
    };
  }

  // 11. GET CHANNEL ACTIVE ORDERS: GET /api/pos/channel-orders
  if (url === '/api/pos/channel-orders' && method === 'GET') {
    const orders = getDsuperOrders();
    const orderType = params.orderType;
    let active = orders.filter((o) => !o.isSettled && ['PENDING', 'APPROVED', 'PREPARING', 'READY'].includes(o.status));
    if (orderType && orderType !== 'ALL') {
      active = active.filter((o) => o.orderType === orderType);
    }
    return { success: true, orders: active };
  }

  // 12. SETTLE TABLE OR CHANNEL: POST /api/pos/settle-table or /api/pos/settle-orders
  if ((url === '/api/pos/settle-table' || url === '/api/pos/settle-orders') && method === 'POST') {
    const sales = getDsuperSales();
    const orders = getDsuperOrders();
    const seq = getDsuperSeq();

    const {
      tableId,
      orderType = 'DINE_IN',
      paymentMethod = 'CASH',
      amountTendered = 0,
      discount = 0,
      discountPercentage = 0,
      tax = 0,
      specialNotesExtra = 0,
      specialNoteCharges = [],
      orders: incomingOrders,
    } = body;

    let targetOrders = [];
    if (incomingOrders && incomingOrders.length > 0) {
      targetOrders = incomingOrders;
    } else if (tableId) {
      targetOrders = orders.filter(
        (o) => String(o.tableId) === String(tableId) && !o.isSettled && !['CANCELLED', 'REJECTED'].includes(o.status)
      );
    }

    let subtotal = 0;
    const itemsSnapshot = [];
    const orderNumbers = [];

    targetOrders.forEach((ord) => {
      subtotal += ord.subtotal || ord.total || 0;
      if (ord.orderNumber) orderNumbers.push(ord.orderNumber);
      (ord.items || []).forEach((it) => {
        itemsSnapshot.push({
          name: it.name,
          quantity: it.quantity,
          price: it.price,
          total: it.total || it.price * it.quantity,
          department: it.department || 'KITCHEN',
          specialInstructions: it.specialInstructions || '',
          noteAmount: it.noteAmount || 0,
        });
      });
    });

    const extraNotes = Number(specialNotesExtra) || 0;
    subtotal += extraNotes;

    const finalDiscount = Number(discount) || 0;
    const finalTax = Number(tax) || 0;
    const finalTotal = Math.max(0, subtotal - finalDiscount + finalTax);
    const tendered = Number(amountTendered) || finalTotal;
    const change = Math.max(0, tendered - finalTotal);

    const tableObj = DEFAULT_TABLES.find((t) => String(t._id) === String(tableId));
    const tableName = tableObj ? tableObj.name : (orderType === 'TAKEAWAY' ? 'Takeaway' : 'Dine-In');

    const newSale = {
      _id: 'ds_sale_' + Date.now(),
      saleNumber: `INV-D${String(seq.saleNum++).padStart(5, '0')}`,
      tableId: tableId || null,
      tableNameSnapshot: tableName,
      orderType,
      orderNumbers: orderNumbers.length > 0 ? orderNumbers : [seq.orderNum++],
      items: itemsSnapshot,
      subtotal,
      discount: finalDiscount,
      discountPercentage: Number(discountPercentage) || 0,
      tax: finalTax,
      specialNotesTotal: extraNotes,
      total: finalTotal,
      paymentMethod,
      paymentStatus: 'PAID',
      amountTendered: tendered,
      changeAmount: change,
      cashierNameSnapshot: 'SuperADMIN',
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mark settled in orders
    const targetIds = new Set(targetOrders.map((o) => String(o._id)));
    const updatedOrders = orders.map((o) => {
      if (targetIds.has(String(o._id)) || (tableId && String(o.tableId) === String(tableId) && !o.isSettled)) {
        return { ...o, status: 'COMPLETED', isSettled: true, updatedAt: new Date().toISOString() };
      }
      return o;
    });

    sales.unshift(newSale);
    saveDsuperSales(sales);
    saveDsuperOrders(updatedOrders);
    saveDsuperSeq(seq);

    return {
      success: true,
      message: 'Settled successfully (Local Storage)',
      sale: newSale,
    };
  }

  // 13. ORDERS: GET /api/orders
  if (url === '/api/orders' && method === 'GET') {
    const orders = getDsuperOrders();
    const status = params.status;
    let filtered = orders;
    if (status && status !== 'ALL') {
      if (status.includes(',')) {
        const statuses = status.split(',');
        filtered = filtered.filter((o) => statuses.includes(o.status));
      } else {
        filtered = filtered.filter((o) => o.status === status);
      }
    }
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, orders: filtered, total: filtered.length };
  }

  // 14. CREATE ORDER: POST /api/orders
  if (url === '/api/orders' && method === 'POST') {
    const orders = getDsuperOrders();
    const seq = getDsuperSeq();

    const orderNumber = seq.orderNum++;
    const tableObj = DEFAULT_TABLES.find((t) => String(t._id) === String(body.tableId));
    const tableName = tableObj ? tableObj.name : (body.orderType === 'TAKEAWAY' ? 'Takeaway' : 'Dine-In');

    const items = (body.items || []).map((it) => ({
      ...it,
      total: it.total || it.price * it.quantity,
    }));
    const total = items.reduce((sum, it) => sum + it.total, 0);

    const newOrder = {
      _id: 'ds_ord_' + Date.now(),
      orderNumber,
      tableId: body.tableId || null,
      tableName,
      orderType: body.orderType || 'DINE_IN',
      customerName: body.customerName || '',
      customerPhone: body.customerPhone || '',
      status: 'APPROVED',
      isSettled: false,
      items,
      subtotal: total,
      total,
      specialInstructions: body.specialInstructions || '',
      priority: body.priority || 'NORMAL',
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    saveDsuperOrders(orders);
    saveDsuperSeq(seq);

    return { success: true, order: newOrder };
  }

  // 15. ORDER ACTIONS: approve / reject / cancel
  if (url.startsWith('/api/orders/') && method === 'POST') {
    const parts = url.split('/');
    const orderId = parts[3];
    const action = parts[4]; // approve, reject, cancel

    let orders = getDsuperOrders();
    const idx = orders.findIndex((o) => String(o._id) === String(orderId));
    if (idx >= 0) {
      if (action === 'approve') orders[idx].status = 'APPROVED';
      else if (action === 'reject') orders[idx].status = 'REJECTED';
      else if (action === 'cancel') orders[idx].status = 'CANCELLED';
      orders[idx].updatedAt = new Date().toISOString();
      saveDsuperOrders(orders);
      return { success: true, order: orders[idx] };
    }
    return { success: false, message: 'Order not found' };
  }

  // 16. STAFF LIST (for salary recipient selection): GET /api/auth/users
  if (url === '/api/auth/users' && method === 'GET') {
    return {
      success: true,
      users: [
        { _id: 'u1', name: 'Super Admin (Owner)', username: 'superadmin', role: 'superadmin', department: 'ALL' },
        { _id: 'u2', name: 'Manager Admin', username: 'admin', role: 'admin', department: 'ALL' },
        { _id: 'u3', name: 'Kamal Perera', username: 'kitchen', role: 'kitchen', department: 'KITCHEN' },
        { _id: 'u4', name: 'Nimal Silva', username: 'juice', role: 'juice', department: 'JUICE' },
        { _id: 'u5', name: 'Ahmed Khan', username: 'waiter', role: 'waiter', department: 'ALL' },
      ],
    };
  }

  return null;
};

/**
 * Configure Axios response interceptor for dsuper.
 * Requests are sent to the local host computer server by default so data is saved in computer storage.
 * If the server is offline or unreachable, it falls back to isolated browser localStorage.
 */
export const setupDsuperInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // If server is unreachable or offline and dsuper is active, provide local fallback
      if (isDsuperUser() && (!error.response || error.response.status >= 500)) {
        try {
          const cfg = error.config || {};
          const mockData = await handleDsuperRequest(cfg);
          if (mockData !== null) {
            return {
              data: mockData,
              status: 200,
              statusText: 'OK (Local Fallback)',
              headers: { 'content-type': 'application/json' },
              config: cfg,
            };
          }
        } catch (fbErr) {
          console.warn('[Dsuper Fallback error]:', fbErr);
        }
      }
      return Promise.reject(error);
    }
  );
};

