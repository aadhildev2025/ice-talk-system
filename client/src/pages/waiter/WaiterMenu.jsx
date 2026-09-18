import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
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

const WaiterMenu = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedWaiterFloor, setSelectedWaiterFloor] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart state: [{ menuItemId, name, price, department, category, quantity, specialInstructions }]
  const [cart, setCart] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [orderInstructions, setOrderInstructions] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Item note modal
  const [editingItemNote, setEditingItemNote] = useState(null);
  const [itemNoteText, setItemNoteText] = useState('');

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
    }

    return () => {
      if (socket) {
        socket.off('menu:updated');
        socket.off('table:updated');
      }
    };
  }, [socket]);

  // Cart manipulation helpers
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

  const handleUpdateQty = (menuItemId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.menuItemId === menuItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleRemoveFromCart = (menuItemId) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const handleSaveItemNote = (e) => {
    e.preventDefault();
    if (!editingItemNote) return;
    setCart((prev) =>
      prev.map((i) =>
        i.menuItemId === editingItemNote.menuItemId
          ? { ...i, specialInstructions: itemNoteText }
          : i
      )
    );
    setEditingItemNote(null);
    setItemNoteText('');
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Submit order -> PENDING -> Admin Receive
  const handlePlaceOrder = async () => {
    if (!selectedTableId) {
      alert('Please select a table before placing order.');
      return;
    }

    if (cart.length === 0) {
      alert('Please add items to cart.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await axios.post('/api/orders', {
        tableId: selectedTableId,
        items: cart,
        specialInstructions: orderInstructions,
      });

      if (res.data.success) {
        setOrderSuccess(res.data.order);
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
    return matchesCat && matchesSearch;
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
            <p className="text-[11px] text-neutral-400 hidden sm:block">Select table, browse menu and place orders</p>
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

      {/* Search & Category Pills */}
      <div className="sticky top-14 z-30 bg-[#0F0F12] border-b border-[#24242E] py-2.5 px-3 sm:px-4 shadow-md shrink-0">
        <div className="max-w-7xl mx-auto space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, drinks, appetizers (e.g. Kottu, Falooda)..."
              className="w-full bg-[#181820] border border-[#2A2A38] focus:border-[#FF6B00] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 outline-none shadow-inner"
            />
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
              All Items ({menuItems.length})
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
              const inCart = cart.find((i) => i.menuItemId === item._id);

              return (
                <div
                  key={item._id}
                  className={`bg-[#141419] border rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between transition-colors select-none ${
                    !item.isAvailable
                      ? 'border-neutral-800 opacity-50 cursor-not-allowed'
                      : inCart
                      ? 'border-orange-500/80 ring-1 ring-orange-500/50 shadow-lg shadow-orange-500/10 bg-[#1A1816]'
                      : 'border-[#24242E] hover:border-neutral-600'
                  }`}
                >
                  <div className="space-y-2 mb-3">
                    {/* Dept badge & Out of stock status */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="bg-[#1C1C24] border border-[#2B2B38] text-neutral-300 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase">
                        {item.department}
                      </span>
                      {!item.isAvailable && (
                        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>

                    {/* Title & Price */}
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs text-white line-clamp-2 leading-snug min-h-[32px]">
                        {item.name}
                      </h3>
                      <p className="font-black text-sm sm:text-base text-[#FF6B00] font-display">
                        Rs. {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Add / Counter Button */}
                  <div>
                    {!item.isAvailable ? (
                      <button
                        disabled
                        className="w-full py-2 bg-neutral-800 text-neutral-500 rounded-xl text-xs font-bold cursor-not-allowed"
                      >
                        Unavailable
                      </button>
                    ) : inCart ? (
                      <div className="flex items-center justify-between bg-[#1C1C24] border border-[#FF6B00]/40 rounded-xl p-1">
                        <button
                          onClick={() => handleUpdateQty(item._id, -1)}
                          className="w-8 h-8 rounded-lg bg-[#282834] active:bg-neutral-700 text-white flex items-center justify-center font-bold text-sm touch-manipulation"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-black text-xs text-white px-2">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item._id, 1)}
                          className="w-8 h-8 rounded-lg bg-[#FF6B00] active:bg-[#E05A00] text-white flex items-center justify-center font-bold text-sm shadow touch-manipulation"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full py-2.5 rounded-xl bg-[#1C1C24] hover:bg-[#FF6B00] active:bg-[#FF6B00] text-neutral-300 hover:text-white border border-[#2B2B38] font-bold text-xs transition-all flex items-center justify-center gap-1.5 touch-manipulation"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD</span>
                      </button>
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
              {/* Step 1: Mandatory Table Selector */}
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
                  {tables
                    .filter(
                      (t) =>
                        t.status !== 'DISABLED' &&
                        (selectedWaiterFloor === 'ALL' || (t.floor || 'Ground Floor') === selectedWaiterFloor)
                    )
                    .map((tbl) => {
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
                    })}
                </div>
              </div>

              {/* Step 2: Selected Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Order Items ({cart.length})
                </h4>

                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="p-3 bg-[#1C1C24] rounded-xl border border-[#2B2B38] space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs text-white">{item.name}</p>
                          <p className="text-[10px] text-neutral-400">
                            Dept: <span className="text-orange-400 font-bold">{item.department}</span> • Rs. {item.price} each
                          </p>
                        </div>
                        <span className="font-bold text-xs text-white">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                        {/* Special item note button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItemNote(item);
                            setItemNoteText(item.specialInstructions || '');
                          }}
                          className="text-[10px] text-[#FF6B00] hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>
                            {item.specialInstructions
                              ? `Note: ${item.specialInstructions}`
                              : '+ Add Note (e.g. Less Spicy)'}
                          </span>
                        </button>

                        {/* Qty Counter */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQty(item.menuItemId, -1)}
                            className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.menuItemId, 1)}
                            className="w-6 h-6 rounded bg-[#FF6B00] hover:bg-[#E05A00] text-white flex items-center justify-center font-bold text-xs shadow"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(item.menuItemId)}
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

              {/* Order Level Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                  Overall Order Instructions (Optional)
                </label>
                <textarea
                  value={orderInstructions}
                  onChange={(e) => setOrderInstructions(e.target.value)}
                  placeholder="e.g. Serve drinks immediately, customer allergic to nuts..."
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 outline-none h-16"
                ></textarea>
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
                disabled={submittingOrder || !selectedTableId}
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

      {/* Item Note Modal */}
      {editingItemNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#17171C] border border-[#2B2B38] rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
            <h3 className="font-bold text-sm text-white">
              Special Instruction for {editingItemNote.name}
            </h3>
            <form onSubmit={handleSaveItemNote} className="space-y-3">
              <textarea
                value={itemNoteText}
                onChange={(e) => setItemNoteText(e.target.value)}
                placeholder="e.g. Less spicy, no onion, extra cheese..."
                className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl p-2.5 text-xs text-white outline-none h-20"
                autoFocus
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItemNote(null)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#FF6B00] text-white text-xs font-bold"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
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
