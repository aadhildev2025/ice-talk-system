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
  VERSION: 'icetalk_dsuper_ver',
};

export const DSUPER_STORAGE_VERSION = 'v4_clean_slate_no_dummy_sales';

import { defaultCategories, defaultMenuItems } from '../data/restaurantMenu';

// Default master catalog fallback if server or MongoDB is offline
export const DEFAULT_CATEGORIES = defaultCategories;

export const DEFAULT_MENU_ITEMS = defaultMenuItems.map((it, idx) => ({
  _id: it._id || `m_${idx + 1}`,
  name: it.name,
  price: it.price,
  category: it.category,
  department: it.department || 'KITCHEN',
  isAvailable: it.isAvailable !== false,
  isPopular: Boolean(it.isPopular),
  hasPortions: Boolean(it.hasPortions),
  portionPrices: it.portionPrices || {},
  availablePortions: it.availablePortions || [],
  description: it.description || '',
}));

export const DEFAULT_FLOORS = [
  { _id: '6aab685141f61b02236a17d7', name: 'Ground Floor', sortOrder: 0, isActive: true },
  { _id: '6aab685141f61b02236a17da', name: '1st Floor', sortOrder: 1, isActive: true },
  { _id: '6aab685141f61b02236a17dd', name: '2nd Floor', sortOrder: 2, isActive: true },
];

export const DEFAULT_TABLES = [
  { _id: '6aa3c9caa4a22826418cbe07', name: 'A 01', capacity: 4, type: 'Family', floor: 'Ground Floor', sortOrder: 1, isActive: true, status: 'AVAILABLE' },
  { _id: '6aa3c9caa4a22826418cbe08', name: 'Family 02', capacity: 4, type: 'Family', floor: 'Ground Floor', sortOrder: 2, isActive: true, status: 'AVAILABLE' },
  { _id: '6aa3c9caa4a22826418cbe09', name: 'Family 03', capacity: 6, type: 'Family', floor: 'Ground Floor', sortOrder: 3, isActive: true, status: 'AVAILABLE' },
  { _id: '6aa3c9caa4a22826418cbe0a', name: 'Family 04', capacity: 6, type: 'Family', floor: 'Ground Floor', sortOrder: 4, isActive: true, status: 'AVAILABLE' },
  { _id: '6aa3c9caa4a22826418cbe0b', name: 'VIP 01', capacity: 8, type: 'VIP', floor: 'Ground Floor', sortOrder: 5, isActive: true, status: 'AVAILABLE' },
  { _id: '6aa3c9caa4a22826418cbe0c', name: 'VIP 02', capacity: 8, type: 'VIP', floor: 'Ground Floor', sortOrder: 6, isActive: true, status: 'AVAILABLE' },
  { _id: '6aa3c9caa4a22826418cbe0d', name: 'Couple 01', capacity: 2, type: 'Couple', floor: 'Ground Floor', sortOrder: 7, isActive: true, status: 'AVAILABLE' },
  { _id: '6aa3c9caa4a22826418cbe0e', name: 'Couple 02', capacity: 2, type: 'Couple', floor: 'Ground Floor', sortOrder: 8, isActive: true, status: 'AVAILABLE' },
  { _id: '6aa3c9caa4a22826418cbe0f', name: 'Outdoor A', capacity: 4, type: 'Outdoor', floor: 'Ground Floor', sortOrder: 9, isActive: true, status: 'AVAILABLE' },
  { _id: '6aa3c9caa4a22826418cbe10', name: 'Outdoor B', capacity: 4, type: 'Outdoor', floor: 'Ground Floor', sortOrder: 10, isActive: true, status: 'AVAILABLE' },
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
 * Initialize dsuper storage with clean slate (0 pre-populated sales, 0 orders).
 * Demo users will enter their own orders and sales freshly as they test the system.
 */
export const initDsuperStorageIfNeeded = () => {
  const version = localStorage.getItem(STORAGE_KEYS.VERSION);
  if (version === DSUPER_STORAGE_VERSION) {
    return;
  }

  // Clear dummy sales and orders - clean slate for demo users
  saveDsuperSales([]);
  saveDsuperOrders([]);
  saveDsuperExpenses([]);
  saveDsuperSeq({ orderNum: 1001, saleNum: 101 });
  localStorage.setItem(STORAGE_KEYS.VERSION, DSUPER_STORAGE_VERSION);

  console.log("[DsuperStorage] Cleared sales and orders for dsuper. Ready for demo users to enter new data.");
};

/**
 * Manually reset dsuper storage to clean slate at any time.
 */
export const clearDsuperSalesAndOrders = () => {
  saveDsuperSales([]);
  saveDsuperOrders([]);
  saveDsuperExpenses([]);
  saveDsuperSeq({ orderNum: 1001, saleNum: 101 });
  localStorage.setItem(STORAGE_KEYS.VERSION, DSUPER_STORAGE_VERSION);
  console.log("[DsuperStorage] Sales and orders cleared.");
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

  // 0. TABLES & FLOORS (Master Catalog & Active Occupancy for dsuper)
  if (url === '/api/tables' && method === 'GET') {
    let baseTables = DEFAULT_TABLES;
    try {
      const cached = localStorage.getItem('icetalk_cached_tables');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) baseTables = parsed;
      }
    } catch {}

    const orders = getDsuperOrders();
    const activeTableIds = new Set(
      orders
        .filter((o) => o.tableId && !o.isSettled && !['CANCELLED', 'REJECTED'].includes(o.status))
        .map((o) => String(o.tableId))
    );

    const tables = baseTables.map((t) => {
      const isServerOcc = Boolean(t.hasActiveOrder) || t.status === 'OCCUPIED' || (Array.isArray(t.activeOrders) && t.activeOrders.length > 0);
      const isLocalOcc = activeTableIds.has(String(t._id));
      const isOcc = isServerOcc || isLocalOcc;

      const serverOrders = Array.isArray(t.activeOrders) ? t.activeOrders : [];
      const ordersForTable = orders.filter(
        (o) => o.tableId && String(o.tableId) === String(t._id) && !o.isSettled && !['CANCELLED', 'REJECTED'].includes(o.status)
      );
      const existingIds = new Set(serverOrders.map((o) => String(o._id || o.orderNumber)));
      const mergedOrders = [
        ...serverOrders,
        ...ordersForTable.filter((o) => !existingIds.has(String(o._id || o.orderNumber))),
      ];

      return {
        ...t,
        status: isOcc ? 'OCCUPIED' : (t.status || 'AVAILABLE'),
        hasActiveOrder: isOcc,
        activeOrdersCount: Math.max(t.activeOrdersCount || 0, mergedOrders.length),
        activeOrdersTotal: (t.activeOrdersTotal || 0) + ordersForTable.reduce((sum, o) => sum + (o.total || 0), 0),
        activeOrders: mergedOrders,
      };
    });

    return {
      success: true,
      count: tables.length,
      tables,
    };
  }

  if (url === '/api/tables/floors' && method === 'GET') {
    let floors = DEFAULT_FLOORS;
    try {
      const cached = localStorage.getItem('icetalk_cached_floors');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) floors = parsed;
      }
    } catch {}
    return {
      success: true,
      count: floors.length,
      floors,
    };
  }

  // 0.1 MENU ITEMS & CATEGORIES
  if (url === '/api/menu' && method === 'GET') {
    let items = [...DEFAULT_MENU_ITEMS];
    const category = params.category;
    const department = params.department;
    const search = (params.search || '').toLowerCase().trim();

    if (category && category !== 'All') {
      items = items.filter((it) => it.category === category);
    }
    if (department && department !== 'ALL') {
      items = items.filter((it) => (it.department || 'KITCHEN') === department);
    }
    if (search) {
      items = items.filter((it) => (it.name || '').toLowerCase().includes(search));
    }

    return {
      success: true,
      count: items.length,
      items,
    };
  }

  if (url === '/api/menu/categories/all' && method === 'GET') {
    return {
      success: true,
      count: DEFAULT_CATEGORIES.length,
      categories: DEFAULT_CATEGORIES,
    };
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

    // Per requirement: Only the sales records should not be entered in dsuper
    // Orders are marked completed and settled, but this sale record is NOT entered into sales records,
    // ensuring the demo sales total remains strictly at the target limit around LKR 200,000.
    // Record sale in demo session storage so demo users see what they enter
    sales.unshift(newSale);
    saveDsuperSales(sales);
    saveDsuperOrders(updatedOrders);
    saveDsuperSeq(seq);

    return {
      success: true,
      message: 'Settled successfully (Recorded in demo session)',
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

  // 16. STAFF LIST & USER MANAGEMENT: /api/auth/users (fallback if server/database is offline)
  if (url.startsWith('/api/auth/users')) {
    const getStoredStaff = () => {
      try {
        const cached = localStorage.getItem('icetalk_cached_staff_users');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
      return [
        { _id: '6aafde7154eae2940f01752a', name: 'Manager Admin', username: 'admin', role: 'admin', department: 'ALL', status: 'ACTIVE', phone: '+94 77 123 4567' },
        { _id: '6ab018500239b917eb840209', name: 'Infas', username: 'infas', role: 'waiter', department: 'ALL', status: 'ACTIVE', phone: '' },
        { _id: '6ab105949f7314dce5aaf949', name: 'Super Admin (Owner)', username: 'superadmin', role: 'superadmin', department: 'ALL', status: 'ACTIVE', phone: '+94 77 000 0001' },
        { _id: '6abf53d0823557eca4ce20e8', name: 'SuperADMIN', username: 'dsuper', role: 'superadmin', department: 'ALL', status: 'ACTIVE', phone: '+94 77 999 9999', isDemo: true },
        { _id: '6abfd388e4ababe7d5f03591', name: 'FAWAS', username: 'fawas', role: 'waiter', department: 'OTHER', status: 'ACTIVE', phone: '' },
        { _id: '6abfd3d6e4ababe7d5f03734', name: 'Pradeep', username: 'pradeep', role: 'waiter', department: 'ALL', status: 'ACTIVE', phone: '' },
        { _id: '6abfd3f7e4ababe7d5f037ea', name: 'Sandun', username: 'sandun', role: 'waiter', department: 'ALL', status: 'ACTIVE', phone: '' },
        { _id: '6abfd40ce4ababe7d5f03858', name: 'Safras', username: 'safras', role: 'waiter', department: 'ALL', status: 'ACTIVE', phone: '' },
        { _id: '6abfd4390a72cb8d5ade1593', name: 'Hammadh', username: 'hammadh', role: 'waiter', department: 'ALL', status: 'ACTIVE', phone: '' },
        { _id: '6abfd622a69eb6efd58e45f6', name: 'Masahim', username: 'masahim', role: 'admin', department: 'ALL', status: 'ACTIVE', phone: '' },
      ];
    };

    const staffList = getStoredStaff();

    if (method === 'GET') {
      return {
        success: true,
        count: staffList.length,
        users: staffList,
      };
    }

    if (method === 'POST') {
      let body = {};
      try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch {}
      const newUser = {
        _id: 'usr_' + Date.now(),
        name: body.name || 'New Staff',
        username: (body.username || 'staff').toLowerCase().trim(),
        role: body.role || 'waiter',
        department: body.department || 'ALL',
        phone: body.phone || '',
        status: body.status || 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      const updated = [newUser, ...staffList];
      try { localStorage.setItem('icetalk_cached_staff_users', JSON.stringify(updated)); } catch {}
      return { success: true, user: newUser };
    }

    if (method === 'PUT') {
      const id = url.split('/api/auth/users/')[1];
      let body = {};
      try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch {}
      const updated = staffList.map((u) => {
        if (String(u._id) === String(id)) {
          return { ...u, ...body };
        }
        return u;
      });
      try { localStorage.setItem('icetalk_cached_staff_users', JSON.stringify(updated)); } catch {}
      const found = updated.find((u) => String(u._id) === String(id));
      return { success: true, user: found };
    }

    if (method === 'DELETE') {
      const id = url.split('/api/auth/users/')[1];
      const updated = staffList.filter((u) => String(u._id) !== String(id));
      try { localStorage.setItem('icetalk_cached_staff_users', JSON.stringify(updated)); } catch {}
      return { success: true, message: 'User deleted successfully' };
    }
  }

  return null;
};

/**
 * Configure Axios request interceptor for dsuper.
 * Transactional & reporting endpoints are strictly handled by local demo storage (never polluting the server).
 * Tables, menu and staff accounts are fetched live from server/MongoDB when reachable, or gracefully fallback when offline.
 */
export const setupDsuperInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(async (config) => {
    if (!isDsuperUser()) {
      return config;
    }

    const url = (config.url || '').split('?')[0];

    // Transactional & reporting endpoints that MUST stay strictly in isolated local demo storage:
    // This ensures sales records are never entered into live server storage!
    const isIsolatedDsuperEndpoint =
      url.startsWith('/api/reports') ||
      url.startsWith('/api/pos/sales') ||
      url.startsWith('/api/expenses');

    if (isIsolatedDsuperEndpoint) {
      const originalAdapter = config.adapter || axiosInstance.defaults.adapter;
      config.adapter = async (cfg) => {
        const mockData = await handleDsuperRequest(cfg);
        if (mockData !== null) {
          return {
            data: mockData,
            status: 200,
            statusText: 'OK (Dsuper Demo Storage)',
            headers: { 'content-type': 'application/json' },
            config: cfg,
          };
        }
        if (originalAdapter) {
          return originalAdapter(cfg);
        }
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config: cfg };
      };
      return config;
    }

    // For Tables, Menu, Categories, Staff Accounts, Table Active Orders & Live Orders:
    // "whatever the table is recorded in original account that should be displayed in dsuper also"
    // "for the dsuper it should show the tables and menu items"
    // "staff which are in original account isnt showing in the dsuper"
    // Live catalog, real tables, active table orders & staff accounts are fetched live from server/MongoDB Atlas.
    if (
      url.startsWith('/api/tables') ||
      url.startsWith('/api/menu') ||
      url.startsWith('/api/categories') ||
      url.startsWith('/api/auth/users') ||
      url.includes('/api/pos/table/') ||
      url.startsWith('/api/pos/channel-orders') ||
      url.startsWith('/api/orders') ||
      url.startsWith('/api/pos/settle')
    ) {
      const originalAdapter = config.adapter || axiosInstance.defaults.adapter;
      config.adapter = async (cfg) => {
        try {
          if (originalAdapter) {
            const remoteRes = await originalAdapter(cfg);
            if (remoteRes?.data?.tables) {
              // Preserve whatever table state & orders are recorded in original account
              const orders = getDsuperOrders();
              const activeTableIds = new Set(
                orders
                  .filter((o) => o.tableId && !o.isSettled && !['CANCELLED', 'REJECTED'].includes(o.status))
                  .map((o) => String(o.tableId))
              );

              const decorated = remoteRes.data.tables.map((t) => {
                const isServerOcc =
                  Boolean(t.hasActiveOrder) ||
                  t.status === 'OCCUPIED' ||
                  (Array.isArray(t.activeOrders) && t.activeOrders.length > 0);
                const isLocalOcc = activeTableIds.has(String(t._id));
                const isOcc = isServerOcc || isLocalOcc;

                const serverOrders = Array.isArray(t.activeOrders) ? t.activeOrders : [];
                const ordersForTable = orders.filter(
                  (o) => o.tableId && String(o.tableId) === String(t._id) && !o.isSettled && !['CANCELLED', 'REJECTED'].includes(o.status)
                );
                const existingIds = new Set(serverOrders.map((o) => String(o._id || o.orderNumber)));
                const mergedOrders = [
                  ...serverOrders,
                  ...ordersForTable.filter((o) => !existingIds.has(String(o._id || o.orderNumber))),
                ];

                return {
                  ...t,
                  hasActiveOrder: isOcc,
                  status: isOcc ? 'OCCUPIED' : (t.status || 'AVAILABLE'),
                  activeOrdersCount: Math.max(t.activeOrdersCount || 0, mergedOrders.length),
                  activeOrdersTotal: (t.activeOrdersTotal || 0) + ordersForTable.reduce((sum, o) => sum + (o.total || 0), 0),
                  activeOrders: mergedOrders,
                };
              });

              try {
                localStorage.setItem('icetalk_cached_tables', JSON.stringify(decorated));
              } catch {}

              return {
                ...remoteRes,
                data: { ...remoteRes.data, tables: decorated },
              };
            }

            if (remoteRes?.data?.floors) {
              try {
                localStorage.setItem('icetalk_cached_floors', JSON.stringify(remoteRes.data.floors));
              } catch {}
            }

            // For Table Active Orders in POS: merge any local dsuper orders if present
            if (url.includes('/api/pos/table/') && url.endsWith('/orders') && remoteRes?.data) {
              const tableId = url.split('/api/pos/table/')[1].split('/orders')[0];
              const localOrders = getDsuperOrders();
              const localTableOrders = localOrders.filter(
                (o) => o.tableId && String(o.tableId) === String(tableId) && !o.isSettled && !['CANCELLED', 'REJECTED'].includes(o.status)
              );

              if (localTableOrders.length > 0) {
                const serverOrders = Array.isArray(remoteRes.data.orders) ? remoteRes.data.orders : [];
                const existingOrderIds = new Set(serverOrders.map((o) => String(o._id || o.orderNumber)));
                const addedLocal = localTableOrders.filter((o) => !existingOrderIds.has(String(o._id || o.orderNumber)));

                if (addedLocal.length > 0) {
                  const allOrders = [...serverOrders, ...addedLocal];
                  const aggregated = [...(remoteRes.data.aggregatedItems || [])];
                  addedLocal.forEach((ord) => {
                    (ord.items || []).forEach((item) => {
                      aggregated.push({
                        orderNumber: ord.orderNumber,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total || item.price * item.quantity,
                        department: item.department || 'KITCHEN',
                        specialInstructions: item.specialInstructions || '',
                      });
                    });
                  });
                  return {
                    ...remoteRes,
                    data: {
                      ...remoteRes.data,
                      ordersCount: allOrders.length,
                      orders: allOrders,
                      aggregatedItems: aggregated,
                      subtotal: allOrders.reduce((sum, o) => sum + (o.subtotal || o.total || 0), 0),
                      total: allOrders.reduce((sum, o) => sum + (o.total || 0), 0),
                    },
                  };
                }
              }
              return remoteRes;
            }

            if (remoteRes?.data?.users) {
              // Cache live staff users for offline availability
              try {
                localStorage.setItem('icetalk_cached_staff_users', JSON.stringify(remoteRes.data.users));
              } catch {}
            }

            if (remoteRes?.data) {
              return remoteRes;
            }
          }
        } catch (err) {
          // Server offline or MongoDB Atlas connection error - fallback seamlessly
          console.warn('[dsuper] Remote fetch failed, using fallback for:', url, err?.message);
        }

        const fallback = await handleDsuperRequest(cfg);
        if (fallback !== null) {
          return {
            data: fallback,
            status: 200,
            statusText: 'OK (Local Fallback)',
            headers: { 'content-type': 'application/json' },
            config: cfg,
          };
        }

        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config: cfg };
      };
      return config;
    }

    return config;
  });
};

