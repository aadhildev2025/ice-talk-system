import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { usePrinter } from '../../context/PrinterContext';
import { useUI } from '../../context/UIContext';
import {
  CreditCard,
  Banknote,
  Globe,
  Grid,
  CheckCircle2,
  Printer,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Calculator,
  AlertCircle,
  Receipt,
  User,
  Search,
  Plus,
  Minus,
  Trash2,
  Utensils,
  Car,
  Bike,
  Clock,
  ChevronRight,
  Flame,
  ArrowRight,
  Delete,
  Check,
  X,
  FileText,
  Building,
} from 'lucide-react';

const AdminPOS = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTableId = searchParams.get('table') || '';
  const initialChannel = searchParams.get('channel') || 'DINE_IN';

  const { socket } = useSocket();
  const { printPreparationSlip, printCustomerReceipt } = usePrinter();
  const { isTouchMode } = useUI();

  // Active Channel: 'DINE_IN' | 'TAKEAWAY' | 'UBEREATS' | 'PICKME'
  const [activeChannel, setActiveChannel] = useState(initialChannel);
  // Channel sub-view: 'MENU' (place new order) | 'ACTIVE_ORDERS' (view/settle existing channel orders)
  const [channelView, setChannelView] = useState('MENU');

  // Dine-In Table states
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTableFloor, setSelectedTableFloor] = useState('ALL');
  const [tableOrdersData, setTableOrdersData] = useState(null);
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Menu & Category states
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuSearch, setMenuSearch] = useState('');
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Active channel orders (unsettled Takeaway, UberEats, PickMe)
  const [channelOrders, setChannelOrders] = useState([]);
  const [selectedChannelOrder, setSelectedChannelOrder] = useState(null);
  const [loadingChannelOrders, setLoadingChannelOrders] = useState(false);

  // Direct Order Cart State: [{ menuItemId, name, price, department, category, quantity, specialInstructions }]
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [channelOrderRef, setChannelOrderRef] = useState('');
  const [orderInstructions, setOrderInstructions] = useState('');
  const [orderPriority, setOrderPriority] = useState('NORMAL');

  // Item Note Modal state
  const [editingItemNoteIndex, setEditingItemNoteIndex] = useState(null);
  const [itemNoteText, setItemNoteText] = useState('');

  // Checkout / Billing states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState(null); // 'CART' | 'TABLE' | 'CHANNEL_ORDER'
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH' | 'CARD' | 'ONLINE'
  const [amountTendered, setAmountTendered] = useState('');
  const [discount, setDiscount] = useState(0);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Load Menu and Categories
  const fetchMenuData = async () => {
    try {
      const [resMenu, resCat] = await Promise.all([
        axios.get('/api/menu'),
        axios.get('/api/menu/categories/all'),
      ]);
      if (resMenu.data.success) setMenuItems(resMenu.data.items);
      if (resCat.data.success) setCategories(resCat.data.categories);
    } catch (err) {
      console.error('Error fetching menu in POS:', err);
    } finally {
      setLoadingMenu(false);
    }
  };

  // Load all tables
  const fetchTables = async () => {
    try {
      const res = await axios.get('/api/tables');
      if (res.data.success) {
        setTables(res.data.tables);
        if (initialTableId && !selectedTable) {
          const matched = res.data.tables.find((t) => t._id === initialTableId);
          if (matched) {
            handleSelectTable(matched);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching POS tables:', err);
    } finally {
      setLoadingTables(false);
    }
  };

  // Load active orders for selected table
  const fetchTableOrders = async (tableId) => {
    setLoadingOrders(true);
    try {
      const res = await axios.get(`/api/pos/table/${tableId}/orders`);
      if (res.data.success) {
        setTableOrdersData(res.data);
        setAmountTendered(String(res.data.total || ''));
      }
    } catch (err) {
      console.error('Error loading table active orders:', err);
      setTableOrdersData(null);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load unsettled channel orders
  const fetchChannelOrders = async () => {
    setLoadingChannelOrders(true);
    try {
      const typeParam = activeChannel === 'DINE_IN' ? '' : `?orderType=${activeChannel}`;
      const res = await axios.get(`/api/pos/channel-orders${typeParam}`);
      if (res.data.success) {
        setChannelOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching channel orders:', err);
    } finally {
      setLoadingChannelOrders(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
    fetchTables();
    fetchChannelOrders();

    if (socket) {
      socket.on('order:created', () => {
        fetchTables();
        fetchChannelOrders();
        if (selectedTable) fetchTableOrders(selectedTable._id);
      });
      socket.on('order:approved', () => {
        fetchTables();
        fetchChannelOrders();
        if (selectedTable) fetchTableOrders(selectedTable._id);
      });
      socket.on('order:ready', () => {
        fetchTables();
        fetchChannelOrders();
        if (selectedTable) fetchTableOrders(selectedTable._id);
      });
      socket.on('order:cancelled', () => {
        fetchTables();
        fetchChannelOrders();
        if (selectedTable) fetchTableOrders(selectedTable._id);
      });
      socket.on('table:updated', () => {
        fetchTables();
      });
      socket.on('sale:completed', () => {
        fetchTables();
        fetchChannelOrders();
      });
    }

    return () => {
      if (socket) {
        socket.off('order:created');
        socket.off('order:approved');
        socket.off('order:ready');
        socket.off('order:cancelled');
        socket.off('table:updated');
        socket.off('sale:completed');
      }
    };
  }, [socket, selectedTable, activeChannel]);

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    fetchTableOrders(table._id);
  };

  // Cart Operations
  const handleAddToCart = (item) => {
    if (!item.isAvailable) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          department: item.department || 'KITCHEN',
          category: item.category,
          quantity: 1,
          specialInstructions: '',
        },
      ];
    });
  };

  const handleUpdateQuantity = (menuItemId, change) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.menuItemId === menuItemId) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveFromCart = (menuItemId) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const handleClearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setChannelOrderRef('');
    setOrderInstructions('');
    setOrderPriority('NORMAL');
  };

  // Calculations
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat =
        selectedCategory === 'All' ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !menuSearch ||
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.code?.toLowerCase().includes(menuSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, menuSearch]);

  // Action: Send Order to Kitchen (Creates order & auto-prints Kitchen Preparation Slip)
  const handleSendToKitchen = async () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add items to place an order.');
      return;
    }

    if (activeChannel === 'DINE_IN' && !selectedTable) {
      alert('Please select a Dine-in table first.');
      return;
    }

    setSubmittingAction(true);
    try {
      const payload = {
        orderType: activeChannel,
        tableId: activeChannel === 'DINE_IN' ? selectedTable._id : undefined,
        customerName,
        customerPhone,
        channelOrderRef,
        specialInstructions: orderInstructions,
        priority: orderPriority,
        autoApprove: true, // Admin direct placement immediately approves & creates prep tasks
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions,
        })),
      };

      const res = await axios.post('/api/orders', payload);
      if (res.data.success) {
        const order = res.data.order;
        // Auto-print kitchen note slip
        printPreparationSlip(order, true);

        // Reset cart
        handleClearCart();
        fetchTables();
        fetchChannelOrders();
        if (selectedTable) fetchTableOrders(selectedTable._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send order to kitchen');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open Checkout Modal
  const openCheckout = (target, orderData = null) => {
    setCheckoutTarget(target);
    setDiscount(0);
    setPaymentMethod('CASH');
    setAmountTendered('');

    if (target === 'CHANNEL_ORDER' && orderData) {
      setSelectedChannelOrder(orderData);
    }
    setShowCheckoutModal(true);
  };

  // Action: Complete Payment & Settle Sale (Prints Final Customer Receipt)
  const handleCompletePayment = async () => {
    setSubmittingAction(true);
    try {
      let finalSale = null;

      if (checkoutTarget === 'CART') {
        // 1. First create the approved order
        const orderRes = await axios.post('/api/orders', {
          orderType: activeChannel,
          tableId: activeChannel === 'DINE_IN' ? selectedTable?._id : undefined,
          customerName,
          customerPhone,
          channelOrderRef,
          specialInstructions: orderInstructions,
          priority: orderPriority,
          autoApprove: true,
          items: cart.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            specialInstructions: i.specialInstructions,
          })),
        });

        if (!orderRes.data.success) throw new Error('Order creation failed');
        const order = orderRes.data.order;

        // Auto-print kitchen slip
        printPreparationSlip(order, false);

        // 2. Immediately settle this order
        const grandTotal = Math.max(0, cartSubtotal - Number(discount));
        const tendered = Number(amountTendered) || grandTotal;

        const settleRes = await axios.post('/api/pos/settle-orders', {
          orderId: order._id,
          paymentMethod,
          amountTendered: tendered,
          discount: Number(discount) || 0,
        });

        if (settleRes.data.success) {
          finalSale = settleRes.data.sale;
          handleClearCart();
        }
      } else if (checkoutTarget === 'TABLE') {
        if (!selectedTable || !tableOrdersData) return;
        const grandTotal = Math.max(0, tableOrdersData.total - Number(discount));
        const tendered = Number(amountTendered) || grandTotal;

        const res = await axios.post('/api/pos/settle-table', {
          tableId: selectedTable._id,
          paymentMethod,
          amountTendered: tendered,
          discount: Number(discount) || 0,
        });

        if (res.data.success) {
          finalSale = res.data.sale;
          setTableOrdersData(null);
          setSelectedTable(null);
        }
      } else if (checkoutTarget === 'CHANNEL_ORDER') {
        if (!selectedChannelOrder) return;
        const grandTotal = Math.max(0, selectedChannelOrder.total - Number(discount));
        const tendered = Number(amountTendered) || grandTotal;

        const res = await axios.post('/api/pos/settle-orders', {
          orderId: selectedChannelOrder._id,
          paymentMethod,
          amountTendered: tendered,
          discount: Number(discount) || 0,
        });

        if (res.data.success) {
          finalSale = res.data.sale;
          setSelectedChannelOrder(null);
        }
      }

      if (finalSale) {
        // Trigger customer final receipt printing automatically
        printCustomerReceipt(finalSale, true);

        setShowCheckoutModal(false);
        fetchTables();
        fetchChannelOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete sale');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Compute checkout modal calculations
  const checkoutSubtotal =
    checkoutTarget === 'CART'
      ? cartSubtotal
      : checkoutTarget === 'TABLE'
      ? tableOrdersData?.total || 0
      : selectedChannelOrder?.total || 0;

  const checkoutGrandTotal = Math.max(0, checkoutSubtotal - Number(discount));
  const tenderedNum = Number(amountTendered);
  const isTenderedEntered = amountTendered !== '' && !isNaN(tenderedNum);
  const checkoutBalance = isTenderedEntered ? tenderedNum - checkoutGrandTotal : 0;
  const checkoutChange = paymentMethod === 'CASH' ? Math.max(0, checkoutBalance) : 0;

  // Numpad key helper for Touch Screen Mode
  const handleNumpadPress = (val) => {
    if (val === 'CLEAR') {
      setAmountTendered('');
    } else if (val === 'BACK') {
      setAmountTendered((prev) => String(prev).slice(0, -1));
    } else if (val === 'EXACT') {
      setAmountTendered(String(checkoutGrandTotal));
    } else if (typeof val === 'number' && val >= 100) {
      setAmountTendered(String((Number(amountTendered) || 0) + val));
    } else {
      setAmountTendered((prev) => String(prev || '') + String(val));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Channel Bar */}
      <div className="bg-[#141419] p-3 md:p-4 rounded-2xl border border-[#24242E] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Channel Selection Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-2xl">
          {/* Dine In */}
          <button
            type="button"
            onClick={() => {
              setActiveChannel('DINE_IN');
              setSearchParams({ channel: 'DINE_IN' });
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
              activeChannel === 'DINE_IN'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400'
                : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2A2A38] hover:border-blue-500/40'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Dine In</span>
          </button>

          {/* Takeaway */}
          <button
            type="button"
            onClick={() => {
              setActiveChannel('TAKEAWAY');
              setSearchParams({ channel: 'TAKEAWAY' });
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
              activeChannel === 'TAKEAWAY'
                ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30 border border-orange-400'
                : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2A2A38] hover:border-orange-500/40'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Take Away</span>
          </button>

          {/* Uber Eats */}
          <button
            type="button"
            onClick={() => {
              setActiveChannel('UBEREATS');
              setSearchParams({ channel: 'UBEREATS' });
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
              activeChannel === 'UBEREATS'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400'
                : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2A2A38] hover:border-emerald-500/40'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Uber Eats</span>
          </button>

          {/* PickMe */}
          <button
            type="button"
            onClick={() => {
              setActiveChannel('PICKME');
              setSearchParams({ channel: 'PICKME' });
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
              activeChannel === 'PICKME'
                ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/30 border border-amber-300'
                : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2A2A38] hover:border-amber-500/40'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>PickMe</span>
          </button>
        </div>

        {/* Channel Sub-Tabs & Refresh */}
        <div className="flex items-center justify-between md:justify-end gap-2">
          {activeChannel !== 'DINE_IN' && (
            <div className="flex bg-[#1C1C24] p-1 rounded-xl border border-[#2B2B38] text-xs">
              <button
                type="button"
                onClick={() => setChannelView('MENU')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  channelView === 'MENU'
                    ? 'bg-[#2E2E3C] text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Place Order (Menu)
              </button>
              <button
                type="button"
                onClick={() => {
                  setChannelView('ACTIVE_ORDERS');
                  fetchChannelOrders();
                }}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  channelView === 'ACTIVE_ORDERS'
                    ? 'bg-[#2E2E3C] text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Active Queue</span>
                {channelOrders.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#FF6B00] text-white text-[10px] flex items-center justify-center font-bold">
                    {channelOrders.length}
                  </span>
                )}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              fetchTables();
              fetchChannelOrders();
              if (selectedTable) fetchTableOrders(selectedTable._id);
            }}
            className="p-2 bg-[#1C1C24] hover:bg-[#252530] text-neutral-300 rounded-xl border border-[#2A2A38] transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: DINE-IN TABLE SELECTION & SETTLEMENT */}
      {activeChannel === 'DINE_IN' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Table Layout (5 cols) */}
          <div className="lg:col-span-5 bg-[#141418] border border-[#24242E] rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#24242E]">
              <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-blue-400" />
                <span>SELECT DINE-IN TABLE</span>
              </h3>
              <span className="text-xs text-neutral-400">
                {tables.filter((t) => t.hasActiveOrder).length} Occupied
              </span>
            </div>

            {/* Floor Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedTableFloor('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedTableFloor === 'ALL'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2A2A38]'
                }`}
              >
                All Floors
              </button>
              {Array.from(new Set(tables.map((t) => t.floor || 'Ground Floor'))).map((fl) => (
                <button
                  key={fl}
                  type="button"
                  onClick={() => setSelectedTableFloor(fl)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedTableFloor === fl
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2A2A38]'
                  }`}
                >
                  {fl}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto max-h-[600px] pr-1">
              {tables
                .filter(
                  (tbl) =>
                    selectedTableFloor === 'ALL' ||
                    (tbl.floor || 'Ground Floor') === selectedTableFloor
                )
                .map((tbl) => {
                  const isSelected = selectedTable?._id === tbl._id;
                  const hasOrder = tbl.hasActiveOrder;
                  const isDisabled = tbl.status === 'DISABLED';

                  return (
                    <button
                      key={tbl._id}
                      disabled={isDisabled}
                      onClick={() => handleSelectTable(tbl)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-white/40 shadow-lg shadow-blue-500/25 scale-[1.02]'
                          : hasOrder
                          ? 'bg-gradient-to-br from-[#281413] to-[#1C1414] border-rose-500/50 hover:border-rose-400 text-rose-100 shadow-md'
                          : 'bg-[#1C1C24] border-[#2A2A38] hover:border-emerald-500/40 text-neutral-300'
                      } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''} ${
                        isTouchMode ? 'min-h-[95px]' : 'min-h-[85px]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {tbl.floor || 'Ground Floor'}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected
                              ? 'bg-white'
                              : hasOrder
                              ? 'bg-rose-500 animate-pulse'
                              : 'bg-emerald-500'
                          }`}
                        ></span>
                      </div>

                      <p className="font-black text-sm text-white mt-1 truncate">{tbl.name}</p>

                      <div className="mt-2 pt-1 border-t border-white/10 flex justify-between items-center text-[10px]">
                        <span className={isSelected ? 'text-white/80' : 'text-neutral-400'}>
                          {tbl.capacity} Seats
                        </span>
                        {hasOrder ? (
                          <span className="font-extrabold text-amber-300">
                            Rs. {tbl.activeOrdersTotal?.toLocaleString()}
                          </span>
                        ) : (
                          <span
                            className={isSelected ? 'text-white' : 'text-emerald-400 font-semibold'}
                          >
                            Free
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Right: Active Table Orders & Bill Settlement (7 cols) */}
          <div className="lg:col-span-7 bg-[#141418] border border-[#24242E] rounded-2xl p-5 flex flex-col justify-between space-y-4">
            {!selectedTable ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-neutral-500 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-2xl text-neutral-600">
                  🍽
                </div>
                <h3 className="font-bold text-base text-neutral-300">No Table Selected</h3>
                <p className="text-xs max-w-xs text-neutral-500">
                  Select an active table on the left to view orders and settle payment, or place a new order.
                </p>
              </div>
            ) : loadingOrders ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : !tableOrdersData || tableOrdersData.ordersCount === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl font-bold">
                  ✓
                </div>
                <h3 className="font-bold text-base text-white">Table: {selectedTable.name}</h3>
                <p className="text-xs text-emerald-400 font-semibold">Table is Currently Available</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveChannel('TAKEAWAY'); // switch to menu mode with table assigned or stay in menu
                    setChannelView('MENU');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  Create New Order on Menu
                </button>
              </div>
            ) : (
              <>
                {/* Table Header Info */}
                <div className="bg-[#1C1C24] p-3.5 rounded-xl border border-[#2B2B38] flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-white font-display">
                        {tableOrdersData.table.name}
                      </span>
                      <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
                        {tableOrdersData.ordersCount} Active Order(s)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {tableOrdersData.orders.map((o) => (
                        <div key={o._id} className="flex items-center gap-1.5 bg-[#141418] px-2.5 py-0.5 rounded-lg border border-[#2B2B38] text-[11px]">
                          <span className="font-bold text-white">#{o.orderNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-neutral-400 uppercase font-semibold">Total Items</p>
                    <p className="font-extrabold text-sm text-white">
                      {tableOrdersData.aggregatedItems.length} items
                    </p>
                  </div>
                </div>

                {/* Aggregated Item Lines */}
                <div className="overflow-y-auto max-h-56 space-y-1.5 pr-1">
                  <div className="flex justify-between text-[11px] font-bold text-neutral-400 px-2 uppercase pb-1 border-b border-[#24242E]">
                    <span>Item</span>
                    <span className="text-center">Qty</span>
                    <span className="text-right">Total</span>
                  </div>

                  {tableOrdersData.aggregatedItems.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 rounded-lg bg-[#191920] border border-[#252532] text-xs hover:bg-[#20202A] transition-colors"
                    >
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-white leading-tight">{it.name}</p>
                        <p className="text-[10px] text-neutral-400">
                          Order #{it.orderNumber} • {it.department}
                        </p>
                      </div>

                      <div className="w-12 text-center font-extrabold text-neutral-300">
                        x{it.quantity}
                      </div>

                      <div className="w-24 text-right font-bold text-neutral-200">
                        Rs. {it.total.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary & Settle Button */}
                <div className="bg-[#191920] p-4 rounded-xl border border-[#262634] space-y-3">
                  <div className="flex justify-between items-center text-sm font-black pb-2 border-b border-[#2B2B38]">
                    <span className="text-neutral-300 uppercase tracking-wider">NET BILL TOTAL:</span>
                    <span className="text-2xl text-[#FF6B00] font-display">
                      Rs. {tableOrdersData.total.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCheckout('TABLE')}
                    className={`w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] hover:from-[#E55A00] hover:to-[#FF6B00] text-white py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                      isTouchMode ? 'h-14 text-base' : ''
                    }`}
                  >
                    <Receipt className="w-5 h-5" />
                    <span>Settle Table & Print Final Receipt</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: MENU & CART (Takeaway, UberEats, PickMe) */}
      {activeChannel !== 'DINE_IN' && channelView === 'MENU' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Menu Catalog (8 Cols) */}
          <div className="lg:col-span-8 bg-[#141418] border border-[#24242E] rounded-2xl p-4 space-y-4 flex flex-col">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-2 border-b border-[#24242E]">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search food, drinks, codes..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className={`w-full bg-[#1C1C24] border border-[#2A2A38] focus:border-[#FF6B00] rounded-xl pl-9 pr-4 text-xs text-white placeholder-neutral-500 outline-none ${
                    isTouchMode ? 'py-3 text-sm' : 'py-2'
                  }`}
                />
              </div>

              {/* Channel Indicator Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                    activeChannel === 'UBEREATS'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : activeChannel === 'PICKME'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                  }`}
                >
                  {activeChannel === 'UBEREATS'
                    ? 'Uber Eats Menu'
                    : activeChannel === 'PICKME'
                    ? 'PickMe Menu'
                    : 'Takeaway Menu'}
                </span>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/20'
                    : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2B2B38]'
                } ${isTouchMode ? 'py-2.5 px-4 text-sm' : ''}`}
              >
                All Items ({menuItems.length})
              </button>
              {categories.map((cat) => {
                const count = menuItems.filter((i) => i.category === cat.name).length;
                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.name
                        ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/20'
                        : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2B2B38]'
                    } ${isTouchMode ? 'py-2.5 px-4 text-sm' : ''}`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Menu Items Grid */}
            {loadingMenu ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="w-8 h-8 border-3 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-neutral-500">
                <p className="text-sm font-semibold">No menu items found.</p>
              </div>
            ) : (
              <div
                className={`grid gap-3 overflow-y-auto max-h-[600px] pr-1 ${
                  isTouchMode
                    ? 'grid-cols-2 sm:grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                }`}
              >
                {filteredMenuItems.map((item) => {
                  const inCartItem = cart.find((i) => i.menuItemId === item._id);
                  const isOut = !item.isAvailable;

                  return (
                    <button
                      key={item._id}
                      type="button"
                      disabled={isOut}
                      onClick={() => handleAddToCart(item)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden group ${
                        inCartItem
                          ? 'bg-gradient-to-br from-[#2D1B12] to-[#1C1412] border-[#FF6B00] shadow-md shadow-orange-500/10'
                          : 'bg-[#1C1C24] border-[#2A2A38] hover:border-neutral-500 text-neutral-200'
                      } ${isOut ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'} ${
                        isTouchMode ? 'min-h-[120px] p-4' : 'min-h-[105px]'
                      }`}
                    >
                      {/* Cart Qty Badge */}
                      {inCartItem && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF6B00] text-white text-xs font-black flex items-center justify-center shadow">
                          {inCartItem.quantity}
                        </div>
                      )}

                      <div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block truncate">
                          {item.category || item.department}
                        </span>
                        <p className="font-bold text-xs text-white mt-0.5 line-clamp-2 leading-tight">
                          {item.name}
                        </p>
                      </div>

                      <div className="mt-2 pt-1 border-t border-neutral-800 flex justify-between items-center">
                        <span className="font-black text-sm text-[#FF6B00]">
                          Rs. {item.price.toLocaleString()}
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-neutral-800 group-hover:bg-[#FF6B00] text-neutral-400 group-hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart & Quick Order Panel (4 Cols) */}
          <div className="lg:col-span-4 bg-[#141418] border border-[#24242E] rounded-2xl p-4 flex flex-col justify-between space-y-4">
            {/* Cart Header */}
            <div className="flex justify-between items-center pb-2 border-b border-[#24242E]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="font-black text-sm text-white">ORDER CART</h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Customer / Order Ref Inputs */}
            <div className="space-y-2 bg-[#1C1C24] p-2.5 rounded-xl border border-[#2B2B38] text-xs">
              <input
                type="text"
                placeholder={
                  activeChannel === 'UBEREATS'
                    ? 'UberEats Order ID (e.g. #UB-9941)'
                    : activeChannel === 'PICKME'
                    ? 'PickMe Order ID (e.g. #PM-1234)'
                    : 'Customer Name (Optional)'
                }
                value={customerName || channelOrderRef}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setChannelOrderRef(e.target.value);
                }}
                className={`w-full bg-[#141418] border border-[#2A2A38] focus:border-[#FF6B00] rounded-lg px-2.5 text-xs text-white placeholder-neutral-500 outline-none ${
                  isTouchMode ? 'py-2.5 text-sm' : 'py-1.5'
                }`}
              />

              <input
                type="text"
                placeholder="Kitchen Note / Special Instructions"
                value={orderInstructions}
                onChange={(e) => setOrderInstructions(e.target.value)}
                className={`w-full bg-[#141418] border border-[#2A2A38] focus:border-[#FF6B00] rounded-lg px-2.5 text-xs text-white placeholder-neutral-500 outline-none ${
                  isTouchMode ? 'py-2.5 text-sm' : 'py-1.5'
                }`}
              />
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 space-y-2">
                  <p className="text-xs font-semibold">Cart is empty</p>
                  <p className="text-[11px] text-neutral-600">
                    Tap items on the menu to build the order.
                  </p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#191920] border border-[#262634] space-y-1.5 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white flex-1 pr-1">{item.name}</span>
                      <span className="font-bold text-[#FF6B00]">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-neutral-800">
                      <span className="text-[10px] text-neutral-400">
                        Rs. {item.price.toLocaleString()} each
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-[#141418] p-0.5 rounded-lg border border-[#2A2A38]">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.menuItemId, -1)}
                          className="w-6 h-6 rounded bg-[#242430] hover:bg-neutral-700 text-neutral-300 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-black text-xs text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.menuItemId, 1)}
                          className="w-6 h-6 rounded bg-[#FF6B00] hover:bg-[#E05A00] text-white flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Dual Actions */}
            <div className="bg-[#191920] p-3.5 rounded-xl border border-[#262634] space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-neutral-300">
                <span>Total Items: {cartItemCount}</span>
                <span className="text-xl font-black text-[#FF6B00] font-display">
                  Rs. {cartSubtotal.toLocaleString()}
                </span>
              </div>

              {/* Action 1: Send to Kitchen (Auto-prints Kitchen Receipt) */}
              <button
                type="button"
                disabled={cart.length === 0 || submittingAction}
                onClick={handleSendToKitchen}
                className={`w-full bg-[#242430] hover:bg-[#303040] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border border-[#3A3A4C] disabled:opacity-50 ${
                  isTouchMode ? 'h-12 text-sm' : ''
                }`}
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Send to Kitchen (Print Kitchen Slip)</span>
              </button>

              {/* Action 2: Fast Pay & Complete (Prints Final Receipt) */}
              <button
                type="button"
                disabled={cart.length === 0 || submittingAction}
                onClick={() => openCheckout('CART')}
                className={`w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] hover:from-[#E55A00] hover:to-[#FF6B00] text-white py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 ${
                  isTouchMode ? 'h-14 text-base' : ''
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Pay & Print Final Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ACTIVE CHANNEL ORDERS QUEUE (Takeaway, UberEats, PickMe) */}
      {activeChannel !== 'DINE_IN' && channelView === 'ACTIVE_ORDERS' && (
        <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#24242E]">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Active Unsettled {activeChannel} Orders</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Orders waiting for customer payment or pickup. Settle when customer pays.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
              {channelOrders.length} Pending Settlement
            </span>
          </div>

          {loadingChannelOrders ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-3 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : channelOrders.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 space-y-2">
              <p className="text-sm font-bold text-neutral-400">No pending channel orders.</p>
              <p className="text-xs text-neutral-500">
                All takeaway and delivery orders are settled!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channelOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="bg-[#1C1C24] border border-[#2B2B38] hover:border-[#FF6B00]/60 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-md transition-all"
                >
                  <div className="flex justify-between items-start pb-2 border-b border-neutral-800">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded">
                        #{ord.orderNumber}
                      </span>
                      <p className="font-bold text-sm text-white mt-1">
                        {ord.tableNameSnapshot || ord.orderType}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {ord.status}
                    </span>
                  </div>

                  <div className="space-y-1 max-h-32 overflow-y-auto text-xs pr-1">
                    {ord.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-neutral-300">
                        <span>
                          {it.quantity}x {it.name}
                        </span>
                        <span className="font-semibold text-neutral-400">
                          Rs. {(it.price * it.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
                    <span className="text-base font-black text-[#FF6B00]">
                      Rs. {ord.total.toLocaleString()}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openCheckout('CHANNEL_ORDER', ord)}
                        className="px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] hover:from-[#E55A00] hover:to-[#FF6B00] text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-all"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Settle & Print</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHECKOUT & FAST SETTLEMENT MODAL (With Touchscreen Numpad) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#17171C] border border-[#2B2B38] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#2B2B38]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="font-bold text-lg text-white">Complete POS Sale & Print</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Summary */}
            <div className="bg-[#1C1C24] p-3.5 rounded-xl border border-[#2B2B38] space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal:</span>
                <span className="font-bold text-white">Rs. {checkoutSubtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-neutral-400">
                <span>Discount (Rs.):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="w-24 bg-[#141418] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-lg px-2 py-1 text-right text-xs text-white outline-none font-bold"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-neutral-800 text-sm font-black">
                <span className="text-neutral-300">NET GRAND TOTAL:</span>
                <span className="text-2xl text-[#FF6B00] font-display">
                  Rs. {checkoutGrandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-[#1C1C24] border-[#2A2A38] text-neutral-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  CASH
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                      : 'bg-[#1C1C24] border-[#2A2A38] text-neutral-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  CARD
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20'
                      : 'bg-[#1C1C24] border-[#2A2A38] text-neutral-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  ONLINE
                </button>
              </div>
            </div>

            {/* Cash Tendered & Balance Calc */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-3 bg-[#1C1C24] p-3 rounded-xl border border-[#2B2B38] text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                      Amount Tendered (Rs.)
                    </label>
                    <input
                      type="number"
                      autoFocus
                      value={amountTendered}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setAmountTendered(e.target.value)}
                      placeholder={`e.g. ${checkoutGrandTotal}`}
                      className="w-full bg-[#141418] border border-[#2E2E3E] focus:border-[#FF6B00] rounded-lg px-2.5 py-1.5 text-sm font-bold text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                      Balance (Rs.)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={
                        !isTenderedEntered
                          ? `Rs. 0`
                          : checkoutBalance >= 0
                          ? `Rs. ${checkoutBalance.toLocaleString()}`
                          : `- Rs. ${Math.abs(checkoutBalance).toLocaleString()} (Due)`
                      }
                      className={`w-full bg-[#141418] border rounded-lg px-2.5 py-1.5 text-sm font-black outline-none cursor-default ${
                        !isTenderedEntered || checkoutBalance >= 0
                          ? 'border-[#2E2E3E] text-emerald-400'
                          : 'border-red-500/50 text-red-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Quick Cash Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAmountTendered(String(checkoutGrandTotal))}
                    className="py-1 px-2.5 bg-[#262634] hover:bg-[#343444] rounded-lg text-emerald-400 font-bold border border-[#2E2E3E] transition-all text-[11px]"
                  >
                    Exact (Rs. {checkoutGrandTotal.toLocaleString()})
                  </button>
                  {[1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmountTendered(String(amt))}
                      className="py-1 px-2.5 bg-[#262634] hover:bg-[#343444] rounded-lg text-white border border-[#2E2E3E] transition-all text-[11px]"
                    >
                      Rs. {amt.toLocaleString()}
                    </button>
                  ))}
                  {amountTendered !== '' && (
                    <button
                      type="button"
                      onClick={() => setAmountTendered('')}
                      className="py-1 px-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-all text-[11px]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Touchscreen Numpad */}
                {isTouchMode && (
                  <div className="bg-[#141418] p-2.5 rounded-xl border border-[#2B2B38] space-y-2">
                    {/* Quick Cash Buttons */}
                    <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => handleNumpadPress('EXACT')}
                        className="py-2 bg-[#262634] hover:bg-[#343444] rounded-lg text-emerald-400 font-black"
                      >
                        Exact
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNumpadPress(500)}
                        className="py-2 bg-[#262634] hover:bg-[#343444] rounded-lg text-white"
                      >
                        +500
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNumpadPress(1000)}
                        className="py-2 bg-[#262634] hover:bg-[#343444] rounded-lg text-white"
                      >
                        +1000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNumpadPress(5000)}
                        className="py-2 bg-[#262634] hover:bg-[#343444] rounded-lg text-white"
                      >
                        +5000
                      </button>
                    </div>

                    {/* Numeric Grid */}
                    <div className="grid grid-cols-3 gap-1.5 text-sm font-bold text-white">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleNumpadPress(num)}
                          className="py-2.5 bg-[#1E1E28] hover:bg-[#2A2A38] rounded-lg shadow-sm active:scale-95"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleNumpadPress('CLEAR')}
                        className="py-2.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30"
                      >
                        C
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNumpadPress(0)}
                        className="py-2.5 bg-[#1E1E28] hover:bg-[#2A2A38] rounded-lg"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNumpadPress('BACK')}
                        className="py-2.5 bg-[#2A2A38] text-neutral-300 rounded-lg hover:bg-[#343444] flex items-center justify-center"
                      >
                        <Delete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm & Print Receipt Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={submittingAction}
                className={`w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] hover:from-[#E55A00] hover:to-[#FF6B00] text-white py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 ${
                  isTouchMode ? 'h-14 text-base' : ''
                }`}
              >
                {submittingAction ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Receipt className="w-5 h-5" />
                    <span>Confirm Payment & Print Receipt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPOS;
