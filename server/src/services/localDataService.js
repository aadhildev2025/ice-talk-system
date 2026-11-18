const fs = require('fs');
const path = require('path');

const getDataDir = () => {
  // 1. Portable Executable directory if launched via portable exe
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    const portableData = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'ice-talk-data');
    if (!fs.existsSync(portableData)) {
      try { fs.mkdirSync(portableData, { recursive: true }); } catch {}
    }
    return portableData;
  }

  // 2. If running inside Electron packaged asar archive, write to OS userData or next to exe
  if (__dirname.includes('app.asar')) {
    const appData =
      process.env.APPDATA ||
      (process.platform === 'darwin'
        ? path.join(process.env.HOME || '', 'Library/Application Support')
        : '/var/local');
    const targetDir = path.join(appData, 'ice-talk-pos', 'data');
    if (!fs.existsSync(targetDir)) {
      try { fs.mkdirSync(targetDir, { recursive: true }); } catch {}
    }
    return targetDir;
  }

  // 3. Next to executable if packaged without asar or unpacked portable directory
  if (process.resourcesPath && !process.resourcesPath.includes('node_modules')) {
    const exeDir = path.dirname(process.execPath);
    if (!exeDir.includes('node_modules') && !exeDir.includes('AppData\\Local\\Temp')) {
      const portableData = path.join(exeDir, 'ice-talk-data');
      if (fs.existsSync(portableData)) {
        return portableData;
      }
      const dataDir = path.join(exeDir, 'data');
      if (!fs.existsSync(dataDir)) {
        try { fs.mkdirSync(dataDir, { recursive: true }); } catch {}
      }
      return dataDir;
    }
  }

  // 4. Default project directory (development and standard Node server)
  return path.join(__dirname, '../../data');
};

const DATA_DIR = getDataDir();
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

const FILES = {
  ORDERS: 'orders.json',
  SALES: 'sales.json',
  EXPENSES: 'expenses.json',
  PREP_TASKS: 'prep_tasks.json',
  CUSTOMERS: 'customers.json',
  CATEGORIES: 'categories.json',
  GROCERY: 'grocery.json',
  SEQ: 'seq.json',
  SETTINGS: 'settings.json',
};

// Safe File Read
const readJSON = (fileName, defaultValue = []) => {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    if (!fs.existsSync(filePath)) {
      // Check if bundled initial template file exists in project server/data
      const templatePath = path.join(__dirname, '../../data', fileName);
      if (templatePath !== filePath && fs.existsSync(templatePath)) {
        try {
          const tplData = fs.readFileSync(templatePath, 'utf8');
          fs.writeFileSync(filePath, tplData, 'utf8');
          return JSON.parse(tplData);
        } catch {}
      }
      writeJSON(fileName, defaultValue);
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error(`[LocalDataService] Read error for ${fileName}:`, err.message);
    return defaultValue;
  }
};

// Safe File Write
const writeJSON = (fileName, data) => {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[LocalDataService] Write error for ${fileName}:`, err.message);
  }
};

// Sequence tracking
const getSeq = () => {
  return readJSON(FILES.SEQ, { orderNum: 1001, saleNum: 101 });
};

const saveSeq = (seq) => {
  writeJSON(FILES.SEQ, seq);
};

const getNextOrderNumber = () => {
  const seq = getSeq();
  const num = seq.orderNum || 1001;
  seq.orderNum = num + 1;
  saveSeq(seq);
  return num;
};

const getNextSaleNumber = () => {
  const seq = getSeq();
  const num = seq.saleNum || 101;
  seq.saleNum = num + 1;
  saveSeq(seq);
  return `INV-${String(num).padStart(6, '0')}`;
};

// Date Matching Helper
const matchesTimeframe = (dateStr, timeframe = 'today', customStart = null, customEnd = null) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();

  if (customStart || customEnd) {
    const s = customStart ? new Date(customStart) : new Date(0);
    const e = customEnd ? new Date(customEnd) : new Date(8640000000000000);
    if (customEnd) e.setHours(23, 59, 59, 999);
    return d >= s && d <= e;
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (timeframe) {
    case 'today':
      return d >= startOfToday && d <= endOfToday;
    case 'yesterday': {
      const yStart = new Date(startOfToday.getTime() - 86400000);
      const yEnd = new Date(endOfToday.getTime() - 86400000);
      return d >= yStart && d <= yEnd;
    }
    case 'thisWeek':
    case 'week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const wStart = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
      return d >= wStart;
    }
    case 'thisMonth':
    case 'month': {
      const mStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return d >= mStart;
    }
    case 'lastMonth': {
      const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return d >= lmStart && d <= lmEnd;
    }
    case 'thisYear':
    case 'year': {
      const yStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      return d >= yStart;
    }
    case 'lastYear': {
      const lyStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      const lyEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      return d >= lyStart && d <= lyEnd;
    }
    case 'all':
      return true;
    default:
      return d >= startOfToday && d <= endOfToday;
  }
};

// Seed realistic demo data if storage is empty
const seedInitialDataIfNeeded = () => {
  const existingSales = readJSON(FILES.SALES, []);
  if (existingSales.length > 0) return;

  console.log('[LocalDataService] Initializing local computer storage with sample data for reports...');

  const sampleCombos = [
    [
      { name: 'Chicken Kottu', quantity: 2, price: 850, department: 'KITCHEN' },
      { name: 'Royal Ice Talk Falooda', quantity: 2, price: 650, department: 'JUICE' },
    ],
    [
      { name: 'Cheese Chicken Kottu', quantity: 1, price: 1150, department: 'KITCHEN' },
      { name: 'Mango Juice', quantity: 2, price: 450, department: 'JUICE' },
      { name: 'Chicken Bun', quantity: 2, price: 450, department: 'BUN' },
    ],
    [
      { name: 'Special Mixed Fried Rice', quantity: 3, price: 1100, department: 'KITCHEN' },
      { name: 'Crispy Chicken Burger', quantity: 2, price: 750, department: 'KITCHEN' },
      { name: 'Fresh Orange Juice', quantity: 3, price: 500, department: 'JUICE' },
    ],
    [
      { name: 'Seafood Nasi Goreng', quantity: 2, price: 1350, department: 'KITCHEN' },
      { name: 'Avocado Shake', quantity: 2, price: 600, department: 'JUICE' },
    ],
    [
      { name: 'Chicken Kottu', quantity: 3, price: 850, department: 'KITCHEN' },
      { name: 'Lime Juice with Mint', quantity: 2, price: 350, department: 'JUICE' },
      { name: 'Vegetable Samosa (3 pcs)', quantity: 2, price: 250, department: 'BUN' },
    ],
  ];

  const now = new Date();
  const sales = [];
  const orders = [];
  let seqOrder = 1001;
  let seqSale = 101;

  const paymentMethods = ['CASH', 'CASH', 'CARD', 'CASH', 'CARD', 'ONLINE'];
  const orderTypes = ['DINE_IN', 'DINE_IN', 'TAKEAWAY', 'DINE_IN', 'DINE_IN', 'DELIVERY'];
  const tableNames = ['Family 01', 'Family 02', 'Couple 01', 'VIP 01', 'Outdoor A', 'Couple 02'];

  // 1. Generate ~24 sales for Today (around 110,000 - 145,000 LKR)
  for (let i = 0; i < 24; i++) {
    const combo = sampleCombos[i % sampleCombos.length];
    const subtotal = combo.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const hour = 10 + Math.floor((i / 24) * 11);
    const minute = (i * 17) % 60;
    const saleDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

    const orderNumber = seqOrder++;
    const saleNumber = `INV-${String(seqSale++).padStart(6, '0')}`;
    const orderType = orderTypes[i % orderTypes.length];
    const tableName = orderType === 'DINE_IN' ? tableNames[i % tableNames.length] : orderType;
    const paymentMethod = paymentMethods[i % paymentMethods.length];

    const sale = {
      _id: `sale_${Date.now()}_${i}`,
      saleNumber,
      tableId: null,
      tableNameSnapshot: tableName,
      orderType,
      orderNumbers: [orderNumber],
      items: combo.map((it) => ({
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
      cashierNameSnapshot: 'Manager Admin',
      isDemo: true,
      createdAt: saleDate.toISOString(),
      updatedAt: saleDate.toISOString(),
    };

    const order = {
      _id: `ord_${Date.now()}_${i}`,
      orderNumber,
      tableId: null,
      tableName,
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
      createdAt: new Date(saleDate.getTime() - 20 * 60000).toISOString(),
      updatedAt: saleDate.toISOString(),
    };

    sales.push(sale);
    orders.push(order);
  }

  // 2. Generate historical sales for the past 28 days (~80 sales)
  for (let dayOffset = 1; dayOffset <= 28; dayOffset++) {
    const salesThisDay = 2 + (dayOffset % 3);
    for (let j = 0; j < salesThisDay; j++) {
      const combo = sampleCombos[(dayOffset + j) % sampleCombos.length];
      const subtotal = combo.reduce((sum, it) => sum + it.price * it.quantity, 0);
      const pastDate = new Date(now.getTime() - dayOffset * 86400000 + (11 + j * 3) * 3600000);

      const orderNumber = seqOrder++;
      const saleNumber = `INV-${String(seqSale++).padStart(6, '0')}`;
      const orderType = orderTypes[(dayOffset + j) % orderTypes.length];
      const tableName = orderType === 'DINE_IN' ? tableNames[(dayOffset + j) % tableNames.length] : orderType;
      const paymentMethod = paymentMethods[(dayOffset + j) % paymentMethods.length];

      sales.push({
        _id: `sale_past_${dayOffset}_${j}`,
        saleNumber,
        tableId: null,
        tableNameSnapshot: tableName,
        orderType,
        orderNumbers: [orderNumber],
        items: combo.map((it) => ({
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
        cashierNameSnapshot: 'Manager Admin',
        isDemo: true,
        createdAt: pastDate.toISOString(),
        updatedAt: pastDate.toISOString(),
      });
    }
  }

  // 3. Generate monthly expenses
  const expenses = [
    {
      _id: 'exp_01',
      title: 'Monthly Staff Salary - Kitchen Team',
      category: 'SALARY',
      amount: 65000,
      date: new Date(now.getFullYear(), now.getMonth(), 2).toISOString(),
      paymentMethod: 'BANK_TRANSFER',
      recipient: 'Kamal Perera',
      recordedByName: 'Manager Admin',
      description: 'Head chef & kitchen crew advance salary',
      receiptRef: 'SAL-2026-03-01',
      isDemo: true,
      createdAt: now.toISOString(),
    },
    {
      _id: 'exp_02',
      title: 'Monthly Staff Salary - Service Staff',
      category: 'SALARY',
      amount: 45000,
      date: new Date(now.getFullYear(), now.getMonth(), 3).toISOString(),
      paymentMethod: 'CASH',
      recipient: 'Ahmed Khan',
      recordedByName: 'Manager Admin',
      description: 'Waiters and service floor staff salary',
      receiptRef: 'SAL-2026-03-02',
      isDemo: true,
      createdAt: now.toISOString(),
    },
    {
      _id: 'exp_03',
      title: 'Weekly Vegetable & Fresh Produce Supply',
      category: 'RAW_MATERIALS',
      amount: 28500,
      date: new Date(now.getTime() - 2 * 86400000).toISOString(),
      paymentMethod: 'CASH',
      recipient: 'Pettah Wholesale Market',
      recordedByName: 'Manager Admin',
      description: 'Fresh vegetables, onions, potatoes, green chillies',
      receiptRef: 'INV-RAW-4482',
      isDemo: true,
      createdAt: now.toISOString(),
    },
    {
      _id: 'exp_04',
      title: 'Dairy, Milk & Ice Cream Stock Purchase',
      category: 'RAW_MATERIALS',
      amount: 34000,
      date: new Date(now.getTime() - 5 * 86400000).toISOString(),
      paymentMethod: 'CASH',
      recipient: 'Highland Dairy Distr.',
      recordedByName: 'Manager Admin',
      description: 'Milk boxes, vanilla and chocolate ice cream tubs',
      receiptRef: 'REC-DAIRY-991',
      isDemo: true,
      createdAt: now.toISOString(),
    },
    {
      _id: 'exp_05',
      title: 'Commercial Kitchen Gas Cylinders Refill (3x 37.5kg)',
      category: 'UTILITIES',
      amount: 24600,
      date: new Date(now.getTime() - 7 * 86400000).toISOString(),
      paymentMethod: 'CASH',
      recipient: 'Litro Gas Lanka',
      recordedByName: 'Manager Admin',
      description: '3 commercial cooking gas cylinders replacement',
      receiptRef: 'GAS-00481',
      isDemo: true,
      createdAt: now.toISOString(),
    },
    {
      _id: 'exp_06',
      title: 'Electricity Bill Payment - Restaurant Floor',
      category: 'UTILITIES',
      amount: 38200,
      date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(),
      paymentMethod: 'ONLINE',
      recipient: 'CEB Ceylon Electricity Board',
      recordedByName: 'Manager Admin',
      description: 'Monthly commercial utility bill',
      receiptRef: 'CEB-BILL-7731',
      isDemo: true,
      createdAt: now.toISOString(),
    },
  ];

  // Write all to computer storage
  writeJSON(FILES.SALES, sales);
  writeJSON(FILES.ORDERS, orders);
  writeJSON(FILES.EXPENSES, expenses);
  writeJSON(FILES.PREP_TASKS, []);
  saveSeq({ orderNum: seqOrder, saleNum: seqSale });

  console.log(`[LocalDataService] Stored ${sales.length} sales, ${orders.length} orders, and ${expenses.length} expenses in ${DATA_DIR}`);
};

// Initialize directory and seed data on load
seedInitialDataIfNeeded();

// --- PUBLIC API ---

// Orders
const getOrders = (filter = {}) => {
  let orders = readJSON(FILES.ORDERS, []);
  if (filter.status && filter.status !== 'ALL') {
    if (filter.status.includes(',')) {
      const statuses = filter.status.split(',').map((s) => s.trim());
      orders = orders.filter((o) => statuses.includes(o.status));
    } else {
      orders = orders.filter((o) => o.status === filter.status);
    }
  }
  if (filter.orderType && filter.orderType !== 'ALL') {
    orders = orders.filter((o) => o.orderType === filter.orderType);
  }
  if (filter.tableId) {
    orders = orders.filter((o) => String(o.tableId) === String(filter.tableId));
  }
  if (filter.waiterId) {
    orders = orders.filter((o) => String(o.waiterId) === String(filter.waiterId));
  }
  if (filter.isSettled !== undefined) {
    orders = orders.filter((o) => Boolean(o.isSettled) === Boolean(filter.isSettled));
  }
  return orders.map((o) => ({
    ...o,
    tableNameSnapshot: o.tableNameSnapshot || o.tableName || 'Dine-In',
    waiterNameSnapshot: o.waiterNameSnapshot || o.waiterName || 'Staff',
  }));
};

const getOrderById = (id) => {
  const orders = readJSON(FILES.ORDERS, []);
  const found = orders.find((o) => String(o._id) === String(id) || String(o.orderNumber) === String(id)) || null;
  if (!found) return null;
  return {
    ...found,
    tableNameSnapshot: found.tableNameSnapshot || found.tableName || 'Dine-In',
    waiterNameSnapshot: found.waiterNameSnapshot || found.waiterName || 'Staff',
  };
};

const saveOrder = (orderData) => {
  const orders = readJSON(FILES.ORDERS, []);
  const tableName = orderData.tableNameSnapshot || orderData.tableName || 'Dine-In';
  const waiterName = orderData.waiterNameSnapshot || orderData.waiterName || 'Staff';

  const newOrder = {
    _id: orderData._id || `ord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    orderNumber: orderData.orderNumber || getNextOrderNumber(),
    orderType: orderData.orderType || 'DINE_IN',
    tableId: orderData.tableId || null,
    tableName: tableName,
    tableNameSnapshot: tableName,
    waiterId: orderData.waiterId || null,
    waiterName: waiterName,
    waiterNameSnapshot: waiterName,
    customerName: orderData.customerName || '',
    customerPhone: orderData.customerPhone || '',
    channelOrderRef: orderData.channelOrderRef || '',
    round: orderData.round || 1,
    status: orderData.status || 'APPROVED',
    isSettled: Boolean(orderData.isSettled),
    items: (orderData.items || []).map((it) => ({
      ...it,
      total: it.total || it.price * it.quantity,
    })),
    subtotal: orderData.subtotal || 0,
    total: orderData.total || 0,
    specialInstructions: orderData.specialInstructions || '',
    priority: orderData.priority || 'NORMAL',
    isDemo: Boolean(orderData.isDemo),
    createdAt: orderData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  writeJSON(FILES.ORDERS, orders);
  return newOrder;
};

const updateOrder = (id, updates) => {
  const orders = readJSON(FILES.ORDERS, []);
  const idx = orders.findIndex((o) => String(o._id) === String(id) || String(o.orderNumber) === String(id));
  if (idx >= 0) {
    const existing = orders[idx];
    const resolvedTable = updates.tableNameSnapshot || updates.tableName || existing.tableNameSnapshot || existing.tableName;
    const resolvedWaiter = updates.waiterNameSnapshot || updates.waiterName || existing.waiterNameSnapshot || existing.waiterName;

    orders[idx] = {
      ...existing,
      ...updates,
      tableName: resolvedTable,
      tableNameSnapshot: resolvedTable,
      waiterName: resolvedWaiter,
      waiterNameSnapshot: resolvedWaiter,
      updatedAt: new Date().toISOString(),
    };
    writeJSON(FILES.ORDERS, orders);
    return orders[idx];
  }
  return null;
};

const deleteOrder = (id) => {
  let orders = readJSON(FILES.ORDERS, []);
  orders = orders.filter((o) => String(o._id) !== String(id) && String(o.orderNumber) !== String(id));
  writeJSON(FILES.ORDERS, orders);
  return true;
};

// Prep Tasks
const getPrepTasks = (filter = {}) => {
  let tasks = readJSON(FILES.PREP_TASKS, []);
  if (filter.orderId) {
    tasks = tasks.filter((t) => String(t.orderId) === String(filter.orderId));
  }
  if (filter.status && filter.status !== 'ALL') {
    tasks = tasks.filter((t) => t.status === filter.status);
  }
  if (filter.department && filter.department !== 'ALL') {
    tasks = tasks.filter((t) => t.department === filter.department);
  }
  return tasks;
};

const savePrepTask = (taskData) => {
  const tasks = readJSON(FILES.PREP_TASKS, []);
  const newTask = {
    _id: taskData._id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    ...taskData,
    createdAt: taskData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.unshift(newTask);
  writeJSON(FILES.PREP_TASKS, tasks);
  return newTask;
};

const updatePrepTask = (id, updates) => {
  const tasks = readJSON(FILES.PREP_TASKS, []);
  const idx = tasks.findIndex((t) => String(t._id) === String(id));
  if (idx >= 0) {
    tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    writeJSON(FILES.PREP_TASKS, tasks);
    return tasks[idx];
  }
  return null;
};

// Sales
const getSales = (filter = {}) => {
  let sales = readJSON(FILES.SALES, []).filter((s) => !s.isDemo);
  if (filter.timeframe) {
    sales = sales.filter((s) => matchesTimeframe(s.createdAt, filter.timeframe, filter.startDate, filter.endDate));
  }
  if (filter.paymentMethod && filter.paymentMethod !== 'ALL') {
    sales = sales.filter((s) => s.paymentMethod === filter.paymentMethod);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    sales = sales.filter(
      (s) =>
        (s.saleNumber && s.saleNumber.toLowerCase().includes(q)) ||
        (s.tableNameSnapshot && s.tableNameSnapshot.toLowerCase().includes(q)) ||
        (s.orderNumbers && s.orderNumbers.some((num) => String(num).includes(q)))
    );
  }
  return sales;
};

const getSaleById = (id) => {
  const sales = readJSON(FILES.SALES, []);
  return sales.find((s) => String(s._id) === String(id)) || null;
};

const saveSale = (saleData) => {
  const sales = readJSON(FILES.SALES, []);
  const newSale = {
    _id: saleData._id || `sale_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    saleNumber: saleData.saleNumber || getNextSaleNumber(),
    tableId: saleData.tableId || null,
    tableNameSnapshot: saleData.tableNameSnapshot || 'Dine-In',
    orderType: saleData.orderType || 'DINE_IN',
    orderNumbers: saleData.orderNumbers || [],
    items: saleData.items || [],
    subtotal: saleData.subtotal || 0,
    discount: saleData.discount || 0,
    discountPercentage: saleData.discountPercentage || 0,
    tax: saleData.tax || 0,
    specialNotesTotal: saleData.specialNotesTotal || 0,
    total: saleData.total || 0,
    paymentMethod: saleData.paymentMethod || 'CASH',
    paymentStatus: 'PAID',
    amountTendered: saleData.amountTendered || saleData.total || 0,
    changeAmount: saleData.changeAmount || 0,
    cashierNameSnapshot: saleData.cashierNameSnapshot || 'Staff',
    waiterName: saleData.waiterName || saleData.waiterNameSnapshot || '',
    waiterNameSnapshot: saleData.waiterNameSnapshot || saleData.waiterName || '',
    isDemo: Boolean(saleData.isDemo),
    createdAt: saleData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  sales.unshift(newSale);
  writeJSON(FILES.SALES, sales);
  return newSale;
};

const deleteSale = (id) => {
  let sales = readJSON(FILES.SALES, []);
  const toDelete = sales.find((s) => String(s._id) === String(id));
  sales = sales.filter((s) => String(s._id) !== String(id));
  writeJSON(FILES.SALES, sales);
  return toDelete || null;
};

// Expenses
const getExpenses = (filter = {}) => {
  let expenses = readJSON(FILES.EXPENSES, []);
  if (filter.timeframe) {
    expenses = expenses.filter((e) => matchesTimeframe(e.date, filter.timeframe, filter.startDate, filter.endDate));
  }
  if (filter.category && filter.category !== 'ALL') {
    expenses = expenses.filter((e) => e.category === filter.category);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    expenses = expenses.filter(
      (e) =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.recipient && e.recipient.toLowerCase().includes(q)) ||
        (e.receiptRef && e.receiptRef.toLowerCase().includes(q))
    );
  }
  return expenses;
};

const getExpenseById = (id) => {
  const expenses = readJSON(FILES.EXPENSES, []);
  return expenses.find((e) => String(e._id) === String(id)) || null;
};

const saveExpense = (expData) => {
  const expenses = readJSON(FILES.EXPENSES, []);
  const newExp = {
    _id: expData._id || `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title: expData.title,
    category: expData.category || 'OTHER',
    amount: Number(expData.amount) || 0,
    date: expData.date ? new Date(expData.date).toISOString() : new Date().toISOString(),
    paymentMethod: expData.paymentMethod || 'CASH',
    recipient: expData.recipient || '',
    recordedByName: expData.recordedByName || 'Staff',
    description: expData.description || '',
    receiptRef: expData.receiptRef || '',
    isDemo: Boolean(expData.isDemo),
    createdAt: new Date().toISOString(),
  };

  expenses.unshift(newExp);
  writeJSON(FILES.EXPENSES, expenses);
  return newExp;
};

const updateExpense = (id, updates) => {
  const expenses = readJSON(FILES.EXPENSES, []);
  const idx = expenses.findIndex((e) => String(e._id) === String(id));
  if (idx >= 0) {
    expenses[idx] = {
      ...expenses[idx],
      ...updates,
      amount: Number(updates.amount !== undefined ? updates.amount : expenses[idx].amount),
    };
    writeJSON(FILES.EXPENSES, expenses);
    return expenses[idx];
  }
  return null;
};

const deleteExpense = (id) => {
  let expenses = readJSON(FILES.EXPENSES, []);
  expenses = expenses.filter((e) => String(e._id) !== String(id));
  writeJSON(FILES.EXPENSES, expenses);
  return true;
};

// Customers Local Computer Storage
const getCustomers = (filter = {}) => {
  let customers = readJSON(FILES.CUSTOMERS, []);
  if (customers.length === 0) {
    customers = [
      {
        _id: 'cust_01',
        name: 'Mohamed Aadhil',
        phone: '0771234567',
        email: 'aadhil@gmail.com',
        address: 'No. 45, Main Street, Colombo',
        notes: 'Regular takeaway, prefers chili paste',
        totalOrders: 12,
        totalSpent: 28500,
        isRegular: true,
        lastOrderDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'cust_02',
        name: 'Kasun Perera',
        phone: '0719876543',
        email: 'kasun.p@yahoo.com',
        address: '12/A, Temple Road, Dehiwala',
        notes: 'No ice in fresh juices',
        totalOrders: 8,
        totalSpent: 16400,
        isRegular: true,
        lastOrderDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'cust_03',
        name: 'Fathima Rizwan',
        phone: '0755551234',
        email: 'fathima.riz@gmail.com',
        address: 'Station Road, Wellawatte',
        notes: 'Family orders Biriyani & Kottu',
        totalOrders: 15,
        totalSpent: 39200,
        isRegular: true,
        lastOrderDate: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'cust_04',
        name: 'Dilani Fernando',
        phone: '0768889900',
        email: 'dilani.f@hotmail.com',
        address: 'Galle Road, Mount Lavinia',
        notes: 'Avocado shakes & burgers',
        totalOrders: 5,
        totalSpent: 8900,
        isRegular: false,
        lastOrderDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'cust_05',
        name: 'Nuwan Jayasinghe',
        phone: '0702223344',
        email: '',
        address: 'Marine Drive, Bambalapitiya',
        notes: 'Dine-in regular guest',
        totalOrders: 9,
        totalSpent: 21500,
        isRegular: true,
        lastOrderDate: new Date(Date.now() - 3 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    writeJSON(FILES.CUSTOMERS, customers);
  }

  if (filter.search && filter.search.trim()) {
    const q = filter.search.trim().toLowerCase();
    customers = customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }

  customers.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
  return customers;
};

const getCustomerById = (id) => {
  const customers = readJSON(FILES.CUSTOMERS, []);
  return customers.find((c) => String(c._id) === String(id)) || null;
};

const saveCustomer = (customerData) => {
  const customers = readJSON(FILES.CUSTOMERS, []);
  const newCustomer = {
    _id: customerData._id || `cust_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: customerData.name?.trim() || 'Guest Customer',
    phone: customerData.phone?.trim() || '',
    email: customerData.email?.trim() || '',
    address: customerData.address?.trim() || '',
    notes: customerData.notes?.trim() || '',
    totalOrders: Number(customerData.totalOrders) || 0,
    totalSpent: Number(customerData.totalSpent) || 0,
    isRegular: Boolean(customerData.isRegular || (customerData.totalOrders && customerData.totalOrders >= 3)),
    lastOrderDate: customerData.lastOrderDate || null,
    createdAt: customerData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  customers.unshift(newCustomer);
  writeJSON(FILES.CUSTOMERS, customers);
  return newCustomer;
};

const updateCustomer = (id, updates) => {
  const customers = readJSON(FILES.CUSTOMERS, []);
  const idx = customers.findIndex((c) => String(c._id) === String(id));
  if (idx >= 0) {
    customers[idx] = {
      ...customers[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeJSON(FILES.CUSTOMERS, customers);
    return customers[idx];
  }
  return null;
};

const deleteCustomer = (id) => {
  let customers = readJSON(FILES.CUSTOMERS, []);
  customers = customers.filter((c) => String(c._id) !== String(id));
  writeJSON(FILES.CUSTOMERS, customers);
  return true;
};

const findOrCreateCustomer = (name, phone, orderTotal = 0) => {
  if (!name && !phone) return null;
  const customers = readJSON(FILES.CUSTOMERS, []);
  const cleanPhone = (phone || '').trim();
  const cleanName = (name || '').trim();

  let customer = null;
  if (cleanPhone) {
    customer = customers.find((c) => c.phone && c.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, ''));
  }
  if (!customer && cleanName && cleanName.toLowerCase() !== 'guest' && cleanName.toLowerCase() !== 'takeaway') {
    customer = customers.find((c) => c.name && c.name.toLowerCase() === cleanName.toLowerCase());
  }

  const amt = Number(orderTotal) || 0;
  if (customer) {
    customer.totalOrders = (Number(customer.totalOrders) || 0) + 1;
    customer.totalSpent = (Number(customer.totalSpent) || 0) + amt;
    customer.isRegular = customer.totalOrders >= 3;
    customer.lastOrderDate = new Date().toISOString();
    customer.updatedAt = new Date().toISOString();
    if (cleanPhone && !customer.phone) customer.phone = cleanPhone;
    writeJSON(FILES.CUSTOMERS, customers);
    return customer;
  } else if (cleanName && cleanName.toLowerCase() !== 'guest' && cleanName.toLowerCase() !== 'takeaway') {
    return saveCustomer({
      name: cleanName,
      phone: cleanPhone,
      totalOrders: 1,
      totalSpent: amt,
      lastOrderDate: new Date().toISOString(),
    });
  }
  return null;
};

// Categories (Local offline computer storage support)
const getCategories = () => {
  let categories = readJSON(FILES.CATEGORIES, []);
  if (!categories || categories.length === 0) {
    try {
      const { defaultCategories } = require('../data/restaurantMenu');
      if (Array.isArray(defaultCategories)) {
        categories = defaultCategories.map((c, idx) => ({
          _id: `cat_${idx + 1}`,
          ...c,
        }));
        writeJSON(FILES.CATEGORIES, categories);
      }
    } catch {}
  }
  return categories;
};

const saveCategory = (catData) => {
  const categories = getCategories();
  const trimmed = catData.name?.trim() || '';
  const existing = categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    return existing;
  }
  const newCat = {
    _id: catData._id || `cat_${Date.now()}`,
    name: trimmed,
    department: (catData.department || 'KITCHEN').toUpperCase(),
    icon: catData.icon || 'Utensils',
    sortOrder: catData.sortOrder !== undefined ? catData.sortOrder : categories.length,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  categories.push(newCat);
  writeJSON(FILES.CATEGORIES, categories);
  return newCat;
};

const updateCategory = (id, updates) => {
  const categories = getCategories();
  const idx = categories.findIndex((c) => String(c._id) === String(id) || c.name === id);
  if (idx >= 0) {
    categories[idx] = { ...categories[idx], ...updates, updatedAt: new Date().toISOString() };
    writeJSON(FILES.CATEGORIES, categories);
    return categories[idx];
  }
  return null;
};

const deleteCategory = (id) => {
  let categories = getCategories();
  categories = categories.filter((c) => String(c._id) !== String(id) && c.name !== id);
  writeJSON(FILES.CATEGORIES, categories);
  return true;
};

// --- REPORT GENERATORS FROM LOCAL COMPUTER STORAGE ---

const getDashboardMetrics = () => {
  const sales = readJSON(FILES.SALES, []).filter((s) => !s.isDemo);
  const orders = readJSON(FILES.ORDERS, []).filter((o) => !o.isDemo);
  const expenses = readJSON(FILES.EXPENSES, []).filter((e) => !e.isDemo);

  const todaySalesList = sales.filter((s) => matchesTimeframe(s.createdAt, 'today'));
  const todaySales = todaySalesList.reduce((sum, s) => sum + (s.total || 0), 0);
  const todaySalesCount = todaySalesList.length;

  const cashSales = todaySalesList.filter((s) => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.total, 0);
  const cardSales = todaySalesList.filter((s) => s.paymentMethod === 'CARD').reduce((sum, s) => sum + s.total, 0);
  const onlineSales = todaySalesList.filter((s) => s.paymentMethod === 'ONLINE').reduce((sum, s) => sum + s.total, 0);

  const todayExpensesList = expenses.filter((e) => matchesTimeframe(e.date, 'today'));
  const todayExpenses = todayExpensesList.reduce((sum, e) => sum + Number(e.amount), 0);

  const todayOrders = orders.filter((o) => matchesTimeframe(o.createdAt, 'today'));
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
    orders.filter((o) => o.tableId && !o.isSettled && !['CANCELLED', 'REJECTED'].includes(o.status)).map((o) => String(o.tableId))
  );

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
      total: 10,
      occupied: occupiedTableIds.size,
      available: Math.max(0, 10 - occupiedTableIds.size),
    },
    recentOrders: orders.slice(0, 6).map((o) => ({
      ...o,
      tableNameSnapshot: o.tableNameSnapshot || o.tableName || 'Dine-In',
      waiterNameSnapshot: o.waiterNameSnapshot || o.waiterName || 'Staff',
    })),
    topItems,
  };
};

const getDetailedReports = ({ timeframe = 'week', startDate, endDate } = {}) => {
  const sales = readJSON(FILES.SALES, []).filter((s) => !s.isDemo);
  const filtered = sales.filter((s) => matchesTimeframe(s.createdAt, timeframe, startDate, endDate));

  filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const totalRevenue = filtered.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalSubtotal = filtered.reduce((sum, s) => sum + (s.subtotal || s.total || 0), 0);
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
};

const getProfitLossReport = ({ timeframe = 'thisMonth', startDate, endDate } = {}) => {
  const sales = readJSON(FILES.SALES, []).filter((s) => !s.isDemo);
  const expenses = readJSON(FILES.EXPENSES, []).filter((e) => !e.isDemo);

  const filteredSales = sales.filter((s) => matchesTimeframe(s.createdAt, timeframe, startDate, endDate));
  const filteredExpenses = expenses.filter((e) => matchesTimeframe(e.date, timeframe, startDate, endDate));

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
};

// ==========================================
// Grocery & Retail Management
// ==========================================
const seedInitialGroceryIfNeeded = () => {
  const existing = readJSON(FILES.GROCERY, []);
  if (existing.length > 0) return existing;
  return [];
};

const getGroceryItems = (filter = {}) => {
  let items = readJSON(FILES.GROCERY, []);
  if (!items || items.length === 0) {
    items = seedInitialGroceryIfNeeded();
  }

  if (filter.search) {
    const q = filter.search.toLowerCase().trim();
    items = items.filter(
      (i) =>
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.barcode && i.barcode.toLowerCase().includes(q)) ||
        (i.category && i.category.toLowerCase().includes(q))
    );
  }

  if (filter.category && filter.category !== 'All') {
    items = items.filter((i) => i.category && i.category.toLowerCase() === filter.category.toLowerCase());
  }

  if (filter.stockStatus) {
    if (filter.stockStatus === 'IN_STOCK') items = items.filter((i) => i.stockQuantity > 0);
    else if (filter.stockStatus === 'OUT_OF_STOCK') items = items.filter((i) => i.stockQuantity <= 0);
    else if (filter.stockStatus === 'LOW_STOCK') items = items.filter((i) => i.stockQuantity > 0 && i.stockQuantity <= (i.lowStockThreshold || 5));
  }

  return items;
};

const getGroceryItemById = (id) => {
  const items = readJSON(FILES.GROCERY, []);
  return items.find((i) => String(i._id) === String(id)) || null;
};

const getGroceryItemByBarcode = (barcode) => {
  if (!barcode) return null;
  const cleanBarcode = String(barcode).trim().toLowerCase();
  const items = readJSON(FILES.GROCERY, []);
  return items.find((i) => i.barcode && String(i.barcode).trim().toLowerCase() === cleanBarcode) || null;
};

const saveGroceryItem = (data) => {
  const items = readJSON(FILES.GROCERY, []);
  const cleanBarcode = String(data.barcode).trim();

  // Check unique barcode
  const existing = items.find((i) => i.barcode && String(i.barcode).trim().toLowerCase() === cleanBarcode.toLowerCase());
  if (existing) {
    throw new Error(`Product with barcode "${cleanBarcode}" already exists (${existing.name})`);
  }

  const newItem = {
    _id: data._id || `groc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: (data.name || '').trim(),
    barcode: cleanBarcode,
    price: Number(data.price) || 0,
    costPrice: Number(data.costPrice) || 0,
    stockQuantity: Math.max(0, Number(data.stockQuantity) || 0),
    lowStockThreshold: Number(data.lowStockThreshold) !== undefined ? Number(data.lowStockThreshold) : 5,
    category: data.category ? String(data.category).trim() : '',
    unit: (data.unit || 'pcs').trim(),
    isAvailable: data.isAvailable !== false,
    description: (data.description || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  items.unshift(newItem);
  writeJSON(FILES.GROCERY, items);
  return newItem;
};

const updateGroceryItem = (id, updateData) => {
  const items = readJSON(FILES.GROCERY, []);
  const index = items.findIndex((i) => String(i._id) === String(id));
  if (index === -1) return null;

  if (updateData.barcode) {
    const cleanBarcode = String(updateData.barcode).trim();
    const duplicate = items.find(
      (i) => String(i._id) !== String(id) && i.barcode && String(i.barcode).trim().toLowerCase() === cleanBarcode.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`Another product with barcode "${cleanBarcode}" already exists (${duplicate.name})`);
    }
  }

  const current = items[index];
  const updated = {
    ...current,
    ...updateData,
    name: updateData.name !== undefined ? updateData.name.trim() : current.name,
    barcode: updateData.barcode !== undefined ? String(updateData.barcode).trim() : current.barcode,
    price: updateData.price !== undefined ? Number(updateData.price) : current.price,
    costPrice: updateData.costPrice !== undefined ? Number(updateData.costPrice) : current.costPrice,
    stockQuantity: updateData.stockQuantity !== undefined ? Math.max(0, Number(updateData.stockQuantity)) : current.stockQuantity,
    lowStockThreshold: updateData.lowStockThreshold !== undefined ? Number(updateData.lowStockThreshold) : current.lowStockThreshold,
    category: updateData.category !== undefined ? (updateData.category ? String(updateData.category).trim() : '') : current.category,
    unit: updateData.unit !== undefined ? updateData.unit.trim() : current.unit,
    isAvailable: updateData.isAvailable !== undefined ? updateData.isAvailable : current.isAvailable,
    description: updateData.description !== undefined ? updateData.description.trim() : current.description,
    updatedAt: new Date().toISOString(),
  };

  items[index] = updated;
  writeJSON(FILES.GROCERY, items);
  return updated;
};

const adjustGroceryStock = (idOrBarcode, deltaQty) => {
  const items = readJSON(FILES.GROCERY, []);
  const key = String(idOrBarcode).trim().toLowerCase();
  const index = items.findIndex(
    (i) => String(i._id) === String(idOrBarcode) || (i.barcode && String(i.barcode).trim().toLowerCase() === key)
  );
  if (index === -1) return null;

  const current = items[index];
  const newStock = Math.max(0, (current.stockQuantity || 0) + Number(deltaQty));
  current.stockQuantity = newStock;
  current.updatedAt = new Date().toISOString();
  items[index] = current;
  writeJSON(FILES.GROCERY, items);
  return current;
};

// Deduct grocery stock when a sale is completed
const reduceGroceryStockFromSale = (saleItems = []) => {
  if (!Array.isArray(saleItems) || saleItems.length === 0) return [];

  const items = readJSON(FILES.GROCERY, []);
  const updatedList = [];

  for (const soldItem of saleItems) {
    const qty = Number(soldItem.quantity) || 1;

    // Find grocery item by groceryItemId, or menuItemId, or barcode, or exact name
    const matchIndex = items.findIndex((g) => {
      if (soldItem.groceryItemId && String(g._id) === String(soldItem.groceryItemId)) return true;
      if (soldItem.menuItemId && String(g._id) === String(soldItem.menuItemId)) return true;
      if (soldItem.barcode && g.barcode && String(g.barcode).trim() === String(soldItem.barcode).trim()) return true;
      if (soldItem.name && g.name && g.name.trim().toLowerCase() === soldItem.name.trim().toLowerCase()) return true;
      return false;
    });

    if (matchIndex !== -1) {
      const g = items[matchIndex];
      const prevStock = Number(g.stockQuantity) || 0;
      g.stockQuantity = Math.max(0, prevStock - qty);
      g.updatedAt = new Date().toISOString();
      items[matchIndex] = g;
      updatedList.push(g);
    }
  }

  if (updatedList.length > 0) {
    writeJSON(FILES.GROCERY, items);
  }

  return updatedList;
};

const deleteGroceryItem = (id) => {
  let items = readJSON(FILES.GROCERY, []);
  const toDelete = items.find((i) => String(i._id) === String(id));
  items = items.filter((i) => String(i._id) !== String(id));
  writeJSON(FILES.GROCERY, items);
  return toDelete || null;
};

// Settings & Takeaway Cancel Code
const getTakeawayCancelCode = () => {
  const settings = readJSON(FILES.SETTINGS, { takeawayCancelCode: '8888' });
  return (settings && settings.takeawayCancelCode) ? String(settings.takeawayCancelCode).trim() : '8888';
};

const setTakeawayCancelCode = (newCode) => {
  const settings = readJSON(FILES.SETTINGS, { takeawayCancelCode: '8888' });
  const codeStr = String(newCode || '').trim() || '8888';
  settings.takeawayCancelCode = codeStr;
  writeJSON(FILES.SETTINGS, settings);
  return codeStr;
};

module.exports = {
  DATA_DIR,
  getOrders,
  getOrderById,
  saveOrder,
  updateOrder,
  deleteOrder,
  getNextOrderNumber,
  getPrepTasks,
  savePrepTask,
  updatePrepTask,
  getSales,
  getSaleById,
  saveSale,
  deleteSale,
  getNextSaleNumber,
  getExpenses,
  getExpenseById,
  saveExpense,
  updateExpense,
  deleteExpense,
  getCustomers,
  getCustomerById,
  saveCustomer,
  updateCustomer,
  deleteCustomer,
  findOrCreateCustomer,
  getCategories,
  saveCategory,
  updateCategory,
  deleteCategory,
  getDashboardMetrics,
  getDetailedReports,
  getProfitLossReport,
  matchesTimeframe,
  getGroceryItems,
  getGroceryItemById,
  getGroceryItemByBarcode,
  saveGroceryItem,
  updateGroceryItem,
  adjustGroceryStock,
  reduceGroceryStockFromSale,
  deleteGroceryItem,
  getTakeawayCancelCode,
  setTakeawayCancelCode,
};

