import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { usePrinter } from '../../context/PrinterContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ToastNotifications from '../../components/ToastNotifications';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Grid,
  CheckCircle2,
  X,
  Flame,
  ClipboardList,
  AlertCircle,
  FileText,
} from 'lucide-react';
import QuickNoteModal from '../../components/QuickNoteModal';

const WaiterMenu = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { printPreparationSlip } = usePrinter();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedWaiterFloor, setSelectedWaiterFloor] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPortionFilter, setSelectedPortionFilter] = useState('ALL'); // 'ALL' | 'PORTION' | 'FULL' | 'HALF'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart state: [{ cartId, menuItemId, name, baseName, portion, price, department, category, quantity, specialInstructions, hasPortions, portionPrices }]
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('DINE_IN');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [orderInstructions, setOrderInstructions] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Quick note modal state
  const [editingCartItem, setEditingCartItem] = useState(null);

  const fetchMenuAndTables = async () => {
    try {
      const [resMenu, resCat, resTables] = await Promise.all([
        axios.get('/api/menu'),
        axios.get('/api/menu/categories/all'),
        axios.get('/api/tables'),
      ]);
      if (resMenu.data.success) setMenuItems(resMenu.data.items);
      if (resCat.data.success) setCategories(resCat.data.categories);
      if (resTables.data.success) setTables(resTables.data.tables);
    } catch (err) {
      console.error('Error loading waiter data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuAndTables();

    if (socket) {
      socket.on('menu:updated', () => fetchMenuAndTables());
      socket.on('table:updated', () => fetchMenuAndTables());
      socket.on('order:created', () => fetchMenuAndTables());
      socket.on('order:cancelled', () => fetchMenuAndTables());
      socket.on('sale:completed', () => fetchMenuAndTables());
    }

    return () => {
      if (socket) {
        socket.off('menu:updated');
        socket.off('table:updated');
        socket.off('order:created');
        socket.off('order:cancelled');
        socket.off('sale:completed');
      }
    };
  }, [socket]);

  // Clear selected table if it becomes occupied or disabled
  useEffect(() => {
    if (selectedTableId) {
      const found = tables.find((t) => t._id === selectedTableId);
      if (!found || found.status !== 'AVAILABLE' || found.hasActiveOrder || found.status === 'DISABLED') {
        setSelectedTableId('');
      }
    }
  }, [tables, selectedTableId]);

  // Direct add item to cart with portion (Portion, Full, Half, etc.)
  const handleAddToCart = (item, portion = 'Portion', customPrice = null) => {
    if (!item.isAvailable) return;

    let price = Number(item.price);
    if (customPrice !== null && !isNaN(customPrice)) {
      price = Number(customPrice);
    } else if (item.portionPrices) {
      const pKey = portion.toLowerCase();
      if (portion === 'Normal' && item.portionPrices.normal) price = item.portionPrices.normal;
      else if (portion === 'Full' && item.portionPrices.full) price = item.portionPrices.full;
      else if (portion === 'Half' && item.portionPrices.half) price = item.portionPrices.half;
      else if (portion === 'Quarter' && item.portionPrices.quarter) price = item.portionPrices.quarter;
      else if (portion === 'With Cheese' && item.portionPrices.withCheese) price = item.portionPrices.withCheese;
      else if (portion === 'Without Cheese' && item.portionPrices.withoutCheese) price = item.portionPrices.withoutCheese;
      else if (item.portionPrices[pKey]) price = item.portionPrices[pKey];
      else if (item.portionPrices.portion) price = item.portionPrices.portion;
      else if (item.portionPrices.normal) price = item.portionPrices.normal;
    }

    const itemName = item.hasPortions ? `${item.name} (${portion})` : item.name;

    setCart((prev) => {
      const existing = prev.find(
        (i) => i.menuItemId === item._id && i.portion === portion && !i.specialInstructions
      );
      if (existing) {
        return prev.map((i) =>
          i.cartId === existing.cartId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          cartId: `${item._id}_${portion}_${Date.now()}_${Math.random()}`,
          menuItemId: item._id,
          name: itemName,
          baseName: item.name,
          portion: portion,
          price: price,
          department: item.department || 'KITCHEN',
          category: item.category,
          quantity: 1,
          specialInstructions: '',
          hasPortions: item.hasPortions,
          portionPrices: item.portionPrices || {},
          availablePortions: item.availablePortions || ['Normal'],
        },
      ];
    });
  };

  // Switch portion in cart
  const handleSwitchCartPortion = (cartId, newPortion) => {
    setCart((prev) => {
      const target = prev.find((i) => i.cartId === cartId);
      if (!target) return prev;

      let newPrice = target.price;
      if (target.portionPrices) {
        if (newPortion === 'Normal' && target.portionPrices.normal) newPrice = target.portionPrices.normal;
        else if (newPortion === 'Full' && target.portionPrices.full) newPrice = target.portionPrices.full;
        else if (newPortion === 'Half' && target.portionPrices.half) newPrice = target.portionPrices.half;
        else if (newPortion === 'Quarter' && target.portionPrices.quarter) newPrice = target.portionPrices.quarter;
        else if (newPortion === 'With Cheese' && target.portionPrices.withCheese) newPrice = target.portionPrices.withCheese;
        else if (newPortion === 'Without Cheese' && target.portionPrices.withoutCheese) newPrice = target.portionPrices.withoutCheese;
        else if (target.portionPrices.portion) newPrice = target.portionPrices.portion;
      }

      const cleanBase = target.baseName || target.name.replace(/\s*\([^)]*\)$/, '');
      const newName = target.hasPortions ? `${cleanBase} (${newPortion})` : target.name;

      return prev.map((i) =>
        i.cartId === cartId
          ? {
              ...i,
              portion: newPortion,
              name: newName,
              price: newPrice,
            }
          : i
      );
    });
  };

  const handleUpdateQty = (cartId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartId === cartId || item.menuItemId === cartId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleRemoveFromCart = (cartId) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId && i.menuItemId !== cartId));
  };

  const handleSaveCartItemNote = (note) => {
    if (!editingCartItem) return;
    setCart((prev) =>
      prev.map((i) =>
        i.cartId === editingCartItem.cartId
          ? { ...i, specialInstructions: (note || '').trim() }
          : i
      )
    );
    setEditingCartItem(null);
  };

  const handleAppendOverallNote = (phrase) => {
    setOrderInstructions((prev) => {
      if (!prev) return phrase;
      const parts = prev.split(',').map((s) => s.trim()).filter(Boolean);
      if (parts.includes(phrase)) return prev;
      return [...parts, phrase].join(', ');
    });
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Submit order -> PENDING -> Admin Receive
  const handlePlaceOrder = async () => {
    if (orderType === 'DINE_IN' && !selectedTableId) {
      alert('Please select a table before placing order.');
      return;
    }

    if (cart.length === 0) {
      alert('Please add items to cart.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const selectedTable = tables.find((t) => t._id === selectedTableId);
      const tableName = selectedTable ? selectedTable.name : (orderType === 'TAKEAWAY' ? 'Takeaway' : 'Table');
      const waiterName = user?.name || user?.username || 'Waiter';

      const payload = {
        orderType,
        tableId: selectedTableId || undefined,
        tableName,
        tableNameSnapshot: tableName,
        waiterName,
        waiterNameSnapshot: waiterName,
        items: cart,
        specialInstructions: orderInstructions,
      };

      const res = await axios.post('/api/orders', payload);

      if (res.data.success) {
        const orderToPrint = {
          ...res.data.order,
          tableNameSnapshot: res.data.order?.tableNameSnapshot || tableName,
          tableName: res.data.order?.tableName || tableName,
          waiterNameSnapshot: res.data.order?.waiterNameSnapshot || waiterName,
          waiterName: res.data.order?.waiterName || waiterName,
        };
        setOrderSuccess(orderToPrint);
        printPreparationSlip(orderToPrint, true);
        setCart([]);
        setOrderInstructions('');
        setSelectedTableId('');
        setCartOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());

    let matchesPortion = true;
    if (selectedPortionFilter === 'NORMAL') {
      matchesPortion = item.hasPortions && (Boolean(item.portionPrices?.normal) || (item.availablePortions || []).includes('Normal'));
    } else if (selectedPortionFilter === 'FULL') {
      matchesPortion = item.hasPortions && (Boolean(item.portionPrices?.full) || (item.availablePortions || []).includes('Full'));
    } else if (selectedPortionFilter === 'HALF') {
      matchesPortion = item.hasPortions && (Boolean(item.portionPrices?.half) || (item.availablePortions || []).includes('Half'));
    } else if (selectedPortionFilter === 'PORTION') {
      matchesPortion = item.name.includes('(Portion)') || (item.availablePortions || []).includes('Portion') || item.category?.includes('(PORTION ONLY)');
    }

    return matchesCat && matchesSearch && matchesPortion;
  });

  const selectedTableObj = tables.find((t) => t._id === selectedTableId);

  return (
    <div className="flex-1 flex flex-col pb-28 bg-[#0A0A0D]">
      <Navbar />

      {/* Sub Header */}
      <div className="bg-[#141418] border-b border-[#24242E] px-3 sm:px-4 py-2.5 sm:py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 truncate">
              <span className="truncate">Welcome, {user?.name || 'Waiter'}</span>
              <span className="text-[9px] uppercase font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 shrink-0">
                Staff Order Pad
              </span>
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">Select table, browse menu with portions and place orders</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/waiter/orders')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-xs font-bold text-neutral-300 hover:text-white border border-[#2A2A38] transition-colors"
            >
              <ClipboardList className="w-3.5 h-3.5 text-orange-400" />
              <span>Orders</span>
            </button>

            {totalCartItems > 0 && (
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-1.5 bg-[#FF6B00] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-orange-500/30"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{totalCartItems} • Rs. {cartTotalAmount.toLocaleString()}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search, Portion Filter & Category Pills */}
      <div className="sticky top-14 z-30 bg-[#0F0F12] border-b border-[#24242E] py-2.5 px-3 sm:px-4 shadow-md shrink-0">
        <div className="max-w-7xl mx-auto space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, drinks, appetizers (e.g. Chicken Rice, Cheese Kottu)..."
              className="w-full bg-[#181820] border border-[#2A2A38] focus:border-[#FF6B00] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 outline-none shadow-inner"
            />
          </div>

          {/* Portion Option Filter Bar: All Sizes | Normal | Full | Half | Portion Only */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-0.5">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
              Size:
            </span>
            <button
              type="button"
              onClick={() => setSelectedPortionFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedPortionFilter === 'ALL'
                  ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/25'
                  : 'bg-[#181820] text-neutral-400 hover:text-white border border-[#24242E]'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedPortionFilter('NORMAL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedPortionFilter === 'NORMAL'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black'
                  : 'bg-[#181820] text-emerald-400 hover:text-white border border-[#24242E]'
              }`}
            >
              <span>🍽️ Normal</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPortionFilter('FULL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedPortionFilter === 'FULL'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-black'
                  : 'bg-[#181820] text-amber-400 hover:text-white border border-[#24242E]'
              }`}
            >
              <span>🍲 Full</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPortionFilter('HALF')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedPortionFilter === 'HALF'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                  : 'bg-[#181820] text-blue-400 hover:text-white border border-[#24242E]'
              }`}
            >
              <span>🥣 Half</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPortionFilter('PORTION')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedPortionFilter === 'PORTION'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                  : 'bg-[#181820] text-purple-400 hover:text-white border border-[#24242E]'
              }`}
            >
              <span>🍛 Portion Only</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] text-white shadow-md shadow-orange-500/25'
                  : 'bg-[#181820] text-neutral-400 hover:text-white border border-[#24242E]'
              }`}
            >
              All Categories
            </button>
            {categories
              .filter((c) => c.name !== 'All')
              .map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] text-white shadow-md shadow-orange-500/25'
                      : 'bg-[#181820] text-neutral-400 hover:text-white border border-[#24242E]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Main Menu Grid */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 w-full flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs bg-[#141418] border border-[#24242E] rounded-2xl">
            No menu items found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
            {filteredItems.map((item) => {
              const itemCartItems = cart.filter((i) => i.menuItemId === item._id);
              const totalInCart = itemCartItems.reduce((acc, i) => acc + i.quantity, 0);

              const normalPrice = item.portionPrices?.normal;
              const portionPrice = item.portionPrices?.portion;
              const fullPrice = item.portionPrices?.full;
              const halfPrice = item.portionPrices?.half;
              const quarterPrice = item.portionPrices?.quarter;
              const withCheesePrice = item.portionPrices?.withCheese;
              const withoutCheesePrice = item.portionPrices?.withoutCheese;

              return (
                <div
                  key={item._id}
                  className={`bg-[#141419] border rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between transition-colors select-none ${
                    !item.isAvailable
                      ? 'border-neutral-800 opacity-50 cursor-not-allowed'
                      : totalInCart > 0
                      ? 'border-orange-500/80 ring-1 ring-orange-500/50 shadow-lg shadow-orange-500/10 bg-[#1A1816]'
                      : 'border-[#24242E] hover:border-neutral-600'
                  }`}
                >
                  <div className="space-y-2 mb-2.5">
                    {/* Dept badge & Out of stock status */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="bg-[#1C1C24] border border-[#2B2B38] text-neutral-300 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase">
                        {item.department}
                      </span>
                      {item.hasPortions && (
                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                          PORTIONS
                        </span>
                      )}
                      {!item.isAvailable && (
                        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>

                    {/* Title & Price */}
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-xs text-white line-clamp-2 leading-snug min-h-[32px]">
                        {item.name}
                      </h3>
                      <p className="font-black text-sm sm:text-base text-[#FF6B00] font-display">
                        Rs. {item.price.toLocaleString()}
                        {item.hasPortions && <span className="text-[10px] font-semibold text-neutral-400 ml-1">/ size</span>}
                      </p>
                    </div>
                  </div>

                  {/* Add / Portion Action Buttons */}
                  <div>
                    {!item.isAvailable ? (
                      <button
                        disabled
                        className="w-full py-2 bg-neutral-800 text-neutral-500 rounded-xl text-xs font-bold cursor-not-allowed"
                      >
                        Unavailable
                      </button>
                    ) : item.hasPortions ? (
                      /* Multi-portion Buttons: Normal, Full, Half */
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          {normalPrice && (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(item, 'Normal', normalPrice)}
                              className="py-1.5 px-1.5 rounded-xl bg-[#1C1C24] hover:bg-emerald-600 active:scale-95 text-white border border-[#2B2B38] hover:border-emerald-500 text-center transition-all flex flex-col items-center justify-center touch-manipulation group"
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-emerald-400 group-hover:text-white font-black uppercase">
                                  Normal
                                </span>
                                {(() => {
                                  const c = itemCartItems.find((i) => i.portion === 'Normal');
                                  return c ? (
                                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
                                      {c.quantity}
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                              <span className="text-[11px] font-bold text-neutral-200 group-hover:text-white">
                                Rs. {normalPrice}
                              </span>
                            </button>
                          )}

                          {portionPrice && !normalPrice && (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(item, 'Portion', portionPrice)}
                              className="py-1.5 px-1.5 rounded-xl bg-[#1C1C24] hover:bg-emerald-600 active:scale-95 text-white border border-[#2B2B38] hover:border-emerald-500 text-center transition-all flex flex-col items-center justify-center touch-manipulation group"
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-emerald-400 group-hover:text-white font-black uppercase">
                                  Portion
                                </span>
                                {(() => {
                                  const c = itemCartItems.find((i) => i.portion === 'Portion');
                                  return c ? (
                                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
                                      {c.quantity}
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                              <span className="text-[11px] font-bold text-neutral-200 group-hover:text-white">
                                Rs. {portionPrice}
                              </span>
                            </button>
                          )}

                          {fullPrice && (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(item, 'Full', fullPrice)}
                              className="py-1.5 px-1.5 rounded-xl bg-[#1C1C24] hover:bg-amber-600 active:scale-95 text-white border border-[#2B2B38] hover:border-amber-500 text-center transition-all flex flex-col items-center justify-center touch-manipulation group"
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-amber-400 group-hover:text-white font-black uppercase">
                                  Full
                                </span>
                                {(() => {
                                  const c = itemCartItems.find((i) => i.portion === 'Full');
                                  return c ? (
                                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">
                                      {c.quantity}
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                              <span className="text-[11px] font-bold text-neutral-200 group-hover:text-white">
                                Rs. {fullPrice}
                              </span>
                            </button>
                          )}

                          {halfPrice && (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(item, 'Half', halfPrice)}
                              className="py-1.5 px-1.5 rounded-xl bg-[#1C1C24] hover:bg-blue-600 active:scale-95 text-white border border-[#2B2B38] hover:border-blue-500 text-center transition-all flex flex-col items-center justify-center touch-manipulation group"
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-blue-400 group-hover:text-white font-black uppercase">
                                  Half
                                </span>
                                {(() => {
                                  const c = itemCartItems.find((i) => i.portion === 'Half');
                                  return c ? (
                                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">
                                      {c.quantity}
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                              <span className="text-[11px] font-bold text-neutral-200 group-hover:text-white">
                                Rs. {halfPrice}
                              </span>
                            </button>
                          )}

                          {quarterPrice && (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(item, 'Quarter', quarterPrice)}
                              className="py-1.5 px-1.5 rounded-xl bg-[#1C1C24] hover:bg-purple-600 active:scale-95 text-white border border-[#2B2B38] hover:border-purple-500 text-center transition-all flex flex-col items-center justify-center touch-manipulation group"
                            >
                              <span className="text-[9px] text-purple-400 group-hover:text-white font-black uppercase">
                                Quarter
                              </span>
                              <span className="text-[11px] font-bold text-neutral-200 group-hover:text-white">
                                Rs. {quarterPrice}
                              </span>
                            </button>
                          )}

                          {withCheesePrice && (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(item, 'With Cheese', withCheesePrice)}
                              className="py-1.5 px-1.5 rounded-xl bg-[#1C1C24] hover:bg-amber-600 active:scale-95 text-white border border-[#2B2B38] hover:border-amber-500 text-center transition-all flex flex-col items-center justify-center touch-manipulation group"
                            >
                              <span className="text-[9px] text-amber-400 group-hover:text-white font-black uppercase">
                                + Cheese
                              </span>
                              <span className="text-[11px] font-bold text-neutral-200 group-hover:text-white">
                                Rs. {withCheesePrice}
                              </span>
                            </button>
                          )}

                          {withoutCheesePrice && (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(item, 'Without Cheese', withoutCheesePrice)}
                              className="py-1.5 px-1.5 rounded-xl bg-[#1C1C24] hover:bg-neutral-600 active:scale-95 text-white border border-[#2B2B38] hover:border-neutral-500 text-center transition-all flex flex-col items-center justify-center touch-manipulation group"
                            >
                              <span className="text-[9px] text-neutral-400 group-hover:text-white font-black uppercase">
                                Plain
                              </span>
                              <span className="text-[11px] font-bold text-neutral-200 group-hover:text-white">
                                Rs. {withoutCheesePrice}
                              </span>
                            </button>
                          )}
                        </div>

                        {totalInCart > 0 && (
                          <p className="text-[10px] font-bold text-[#FF6B00] bg-[#1E1712] border border-[#FF6B00]/25 rounded-lg py-0.5 px-1 text-center truncate">
                            In Order: {itemCartItems.map((c) => `${c.quantity}x ${c.portion}`).join(', ')}
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Single Portion Item */
                      <div>
                        {itemCartItems.length > 0 ? (
                          <div className="flex items-center justify-between bg-[#1C1C24] border border-[#FF6B00]/40 rounded-xl p-1">
                            <button
                              onClick={() => handleUpdateQty(itemCartItems[0].cartId, -1)}
                              className="w-8 h-8 rounded-lg bg-[#282834] active:bg-neutral-700 text-white flex items-center justify-center font-bold text-sm touch-manipulation"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-black text-xs text-white px-2">
                              {itemCartItems[0].quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(itemCartItems[0].cartId, 1)}
                              className="w-8 h-8 rounded-lg bg-[#FF6B00] active:bg-[#E05A00] text-white flex items-center justify-center font-bold text-sm shadow touch-manipulation"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item, item.name.includes('(Portion)') ? 'Portion' : 'Standard')}
                            className="w-full py-2.5 rounded-xl bg-[#1C1C24] hover:bg-[#FF6B00] active:bg-[#FF6B00] text-neutral-300 hover:text-white border border-[#2B2B38] font-bold text-xs transition-all flex items-center justify-center gap-1.5 touch-manipulation"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{item.name.includes('(Portion)') ? 'ADD PORTION' : 'ADD ITEM'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-3 left-4 right-4 z-40 max-w-lg mx-auto">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8526] hover:from-[#E55A00] hover:to-[#FF6B00] text-white py-3.5 px-5 rounded-2xl shadow-2xl shadow-orange-500/40 flex items-center justify-between border border-white/20 transform transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">
                  {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in order
                </p>
                <p className="text-[10px] text-white/80">
                  {selectedTableObj ? `Table: ${selectedTableObj.name}` : 'Click to select table & review'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-black text-base font-display">
                Rs. {cartTotalAmount.toLocaleString()}
              </span>
              <span className="text-xs bg-white text-black font-extrabold px-2.5 py-1 rounded-lg">
                View →
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Cart & Table Selection Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141419] border-l border-[#24242E] max-w-md w-full h-full flex flex-col justify-between shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 bg-[#1C1C24] border-b border-[#2B2B38] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-black text-white text-base">Current Order Review</h3>
                  <p className="text-xs text-neutral-400">{totalCartItems} items selected</p>
                </div>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Order Channel Selector (Dine-In or Takeaway) */}
              <div className="bg-[#1C1C24] p-2.5 rounded-2xl border border-[#2B2B38] space-y-2">
                <div className="flex bg-[#141418] p-1 rounded-xl border border-[#2B2B38] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setOrderType('DINE_IN')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      orderType === 'DINE_IN'
                        ? 'bg-[#FF6B00] text-white shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    🍽️ Dine In
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('TAKEAWAY')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      orderType === 'TAKEAWAY'
                        ? 'bg-[#FF6B00] text-white shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    🥡 Takeaway
                  </button>
                </div>
              </div>

              {/* Table Selector - Only for DINE_IN */}
              {orderType === 'DINE_IN' && (
                <div className="bg-[#1C1C24] p-3.5 rounded-2xl border border-[#2B2B38] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Grid className="w-4 h-4 text-orange-400" />
                      <span>Select Dining Table <span className="text-rose-400">*</span></span>
                    </label>
                    {selectedTableObj && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {selectedTableObj.name} Selected
                      </span>
                    )}
                  </div>

                  {/* Floor Filter */}
                  <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setSelectedWaiterFloor('ALL')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap transition-all ${
                        selectedWaiterFloor === 'ALL'
                          ? 'bg-[#FF6B00] text-white shadow'
                          : 'bg-[#141418] text-neutral-400 hover:text-white border border-[#2A2A38]'
                      }`}
                    >
                      All
                    </button>
                    {Array.from(new Set(tables.map((t) => t.floor || 'Ground Floor'))).map((fl) => (
                      <button
                        key={fl}
                        type="button"
                        onClick={() => setSelectedWaiterFloor(fl)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap transition-all ${
                          selectedWaiterFloor === fl
                            ? 'bg-[#FF6B00] text-white shadow'
                            : 'bg-[#141418] text-neutral-400 hover:text-white border border-[#2A2A38]'
                        }`}
                      >
                        {fl}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                    {(() => {
                      const availableTables = tables.filter(
                        (t) =>
                          t.status === 'AVAILABLE' &&
                          !t.hasActiveOrder &&
                          t.status !== 'DISABLED' &&
                          (selectedWaiterFloor === 'ALL' || (t.floor || 'Ground Floor') === selectedWaiterFloor)
                      );

                      if (availableTables.length === 0) {
                        return (
                          <div className="col-span-full py-4 px-2 text-center bg-[#141418] rounded-xl border border-dashed border-[#2A2A38]">
                            <p className="text-xs font-semibold text-neutral-400">No available tables</p>
                            <p className="text-[10px] text-neutral-500 mt-0.5">
                              All tables on {selectedWaiterFloor === 'ALL' ? 'all floors' : selectedWaiterFloor} are currently occupied with active orders.
                            </p>
                          </div>
                        );
                      }

                      return availableTables.map((tbl) => {
                        const isSelected = selectedTableId === tbl._id;
                        return (
                          <button
                            key={tbl._id}
                            type="button"
                            onClick={() => setSelectedTableId(tbl._id)}
                            className={`p-2 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'bg-[#FF6B00] text-white border-white/30 font-bold shadow'
                                : 'bg-[#141418] text-neutral-300 border-[#2A2A38] hover:border-orange-500/40'
                            }`}
                          >
                            <span className="text-[8px] font-bold text-amber-400 block truncate">
                              {tbl.floor || 'Ground Floor'}
                            </span>
                            <p className="text-xs font-bold truncate">{tbl.name}</p>
                            <p
                              className={`text-[9px] ${
                                isSelected ? 'text-white/80' : 'text-neutral-500'
                              }`}
                            >
                              {tbl.type} • {tbl.capacity}p
                            </p>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Step 2: Selected Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Order Items ({cart.length})
                </h4>

                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.cartId}
                      className="p-3 bg-[#1C1C24] rounded-xl border border-[#2B2B38] space-y-2"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-xs text-white leading-tight">{item.name}</p>
                            {item.portion && (
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                                item.portion.toLowerCase() === 'full'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : item.portion.toLowerCase() === 'half'
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}>
                                {item.portion}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Dept: <span className="text-orange-400 font-bold">{item.department}</span> • Rs. {item.price.toLocaleString()} each
                          </p>
                        </div>
                        <span className="font-bold text-xs text-white shrink-0">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      {/* Quick Portion Switcher in Cart */}
                      {item.hasPortions && item.availablePortions && item.availablePortions.length > 1 && (
                        <div className="flex items-center gap-1.5 bg-[#14141A] p-1.5 rounded-lg border border-[#262635]">
                          <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold pl-0.5">Size:</span>
                          <div className="flex items-center gap-1 flex-wrap">
                            {item.availablePortions.map((p) => {
                              const isSelected = item.portion === p;
                              return (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => handleSwitchCartPortion(item.cartId, p)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow'
                                      : 'bg-[#22222E] text-neutral-400 hover:text-white hover:bg-[#2C2C3D]'
                                  }`}
                                >
                                  {p}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Item Special Note Badge or Add Button */}
                      {item.specialInstructions ? (
                        <div className="flex items-center justify-between text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded px-2 py-0.5">
                          <span className="italic truncate max-w-[190px]">* {item.specialInstructions}</span>
                          <button
                            type="button"
                            onClick={() => setEditingCartItem(item)}
                            className="text-[10px] text-amber-400 hover:text-white font-bold ml-1"
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingCartItem(item)}
                          className="text-[10px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 font-medium transition-colors"
                        >
                          <FileText className="w-3 h-3 text-neutral-500" />
                          + Note
                        </button>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                        <span className="text-[11px] text-neutral-400 font-medium">
                          Rs. {item.price.toLocaleString()} ea
                        </span>

                        {/* Qty Counter */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQty(item.cartId, -1)}
                            className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.cartId, 1)}
                            className="w-6 h-6 rounded bg-[#FF6B00] hover:bg-[#E05A00] text-white flex items-center justify-center font-bold text-xs shadow"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(item.cartId)}
                            className="p-1 text-neutral-500 hover:text-rose-400 ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


            </div>

            {/* Drawer Footer & Submit Button */}
            <div className="p-4 bg-[#1C1C24] border-t border-[#2B2B38] space-y-3">
              <div className="flex justify-between items-center text-sm font-black">
                <span className="text-neutral-300">TOTAL BILL:</span>
                <span className="text-2xl text-[#FF6B00] font-display">
                  Rs. {cartTotalAmount.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submittingOrder || (orderType === 'DINE_IN' && !selectedTableId)}
                className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] hover:from-[#E55A00] hover:to-[#FF6B00] text-white py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {submittingOrder ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Place Order → Send to Admin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Note Modal: For editing existing cart item note */}
      {editingCartItem && (
        <QuickNoteModal
          isOpen={Boolean(editingCartItem)}
          item={editingCartItem}
          initialNote={editingCartItem?.specialInstructions || ''}
          title={`Special Note: ${editingCartItem?.name}`}
          onClose={() => setEditingCartItem(null)}
          onSkip={() => handleSaveCartItemNote('')}
          onSave={(note) => handleSaveCartItemNote(note)}
        />
      )}


      {/* Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141419] border border-emerald-500/50 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>
            <div>
              <h3 className="font-black text-xl text-white">Order Placed!</h3>
              <p className="text-xs text-neutral-300 mt-1">
                Order <span className="font-bold text-white">#{orderSuccess.orderNumber}</span> for{' '}
                <span className="font-bold text-white">Table {orderSuccess.tableNameSnapshot}</span> is now{' '}
                <span className="font-bold text-amber-400">PENDING</span> Admin approval.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setOrderSuccess(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold"
              >
                Create Another Order
              </button>
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  navigate('/waiter/orders');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05A00] text-white text-xs font-bold shadow"
              >
                Track Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastNotifications />
    </div>
  );
};

export default WaiterMenu;
