import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import {
  ShoppingBag,
  Barcode,
  RefreshCw,
  Plus,
  PackageCheck,
  AlertTriangle,
  TrendingDown,
  Search,
  X,
  Check,
  Copy,
  Edit,
  Trash2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const GroceryManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const [scannedResult, setScannedResult] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    price: '',
    costPrice: '',
    stockQuantity: '',
    lowStockThreshold: 5,
    category: '',
    unit: 'pcs',
    description: '',
    isAvailable: true,
  });

  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('grocery_custom_categories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copiedBarcode, setCopiedBarcode] = useState(null);

  const barcodeInputRef = useRef(null);
  const scannerInputRef = useRef(null);
  const { socket } = useSocket();

  const fetchGroceryItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/grocery');
      if (res.data.success) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to load grocery items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroceryItems();

    if (socket) {
      socket.on('grocery:updated', () => fetchGroceryItems());
      socket.on('sale:completed', () => fetchGroceryItems());
    }

    return () => {
      if (socket) {
        socket.off('grocery:updated');
        socket.off('sale:completed');
      }
    };
  }, [socket]);

  const categories = useMemo(() => {
    const set = new Set();
    items.forEach((it) => {
      if (it.category && it.category.trim()) set.add(it.category.trim());
    });
    customCategories.forEach((c) => {
      if (c && c.trim()) set.add(c.trim());
    });
    return ['All', ...Array.from(set)];
  }, [items, customCategories]);

  const formCategories = useMemo(() => {
    const set = new Set();
    items.forEach((it) => {
      if (it.category && it.category.trim()) set.add(it.category.trim());
    });
    customCategories.forEach((c) => {
      if (c && c.trim()) set.add(c.trim());
    });
    return Array.from(set);
  }, [items, customCategories]);

  const handleAddNewCategory = () => {
    const trimmed = newCatName.trim();
    if (trimmed) {
      setCustomCategories((prev) => {
        if (!prev.includes(trimmed)) {
          const next = [...prev, trimmed];
          try {
            localStorage.setItem('grocery_custom_categories', JSON.stringify(next));
          } catch {}
          return next;
        }
        return prev;
      });
      setFormData((prev) => ({ ...prev, category: trimmed }));
      setNewCatName('');
      setShowNewCatInput(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchCat =
        selectedCategory === 'All' ||
        (it.category && it.category.toLowerCase() === selectedCategory.toLowerCase());

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (it.name && it.name.toLowerCase().includes(q)) ||
        (it.barcode && it.barcode.toLowerCase().includes(q)) ||
        (it.category && it.category.toLowerCase().includes(q));

      const qty = Number(it.stockQuantity) || 0;
      const threshold = Number(it.lowStockThreshold) || 5;

      let matchStock = true;
      if (stockFilter === 'IN_STOCK') {
        matchStock = qty > 0;
      } else if (stockFilter === 'LOW_STOCK') {
        matchStock = qty > 0 && qty <= threshold;
      } else if (stockFilter === 'OUT_OF_STOCK') {
        matchStock = qty <= 0;
      }

      return matchCat && matchSearch && matchStock;
    });
  }, [items, selectedCategory, search, stockFilter]);

  const metrics = useMemo(() => {
    const totalProducts = items.length;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValuation = 0;

    items.forEach((it) => {
      const qty = Number(it.stockQuantity) || 0;
      const price = Number(it.price) || 0;
      const thresh = Number(it.lowStockThreshold) || 5;

      totalStockUnits += qty;
      totalValuation += qty * price;

      if (qty <= 0) {
        outOfStockCount++;
      } else if (qty <= thresh) {
        lowStockCount++;
      }
    });

    return { totalProducts, totalStockUnits, lowStockCount, outOfStockCount, totalValuation };
  }, [items]);

  const openAddModal = () => {
    setEditingItem(null);
    setShowNewCatInput(false);
    setNewCatName('');
    setFormData({
      name: '',
      barcode: '',
      price: '',
      costPrice: '',
      stockQuantity: '',
      lowStockThreshold: 5,
      category: '',
      unit: 'pcs',
      description: '',
      isAvailable: true,
    });
    setError('');
    setModalOpen(true);
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 150);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setShowNewCatInput(false);
    setNewCatName('');
    setFormData({
      name: item.name || '',
      barcode: item.barcode || '',
      price: item.price !== undefined ? item.price : '',
      costPrice: item.costPrice !== undefined ? item.costPrice : '',
      stockQuantity: item.stockQuantity !== undefined ? item.stockQuantity : '',
      lowStockThreshold: item.lowStockThreshold !== undefined ? item.lowStockThreshold : 5,
      category: item.category || '',
      unit: item.unit || 'pcs',
      description: item.description || '',
      isAvailable: item.isAvailable !== false,
    });
    setError('');
    setModalOpen(true);
  };

  const generateBarcode = () => {
    const randomBarcode = '890' + Math.floor(100000000 + Math.random() * 900000000).toString();
    setFormData((prev) => ({ ...prev, barcode: randomBarcode }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!formData.barcode.trim()) {
      setError('Product barcode is required.');
      return;
    }
    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setError('Please enter a valid selling price.');
      return;
    }
    if (
      formData.stockQuantity === '' ||
      isNaN(Number(formData.stockQuantity)) ||
      Number(formData.stockQuantity) < 0
    ) {
      setError('Please enter a valid stock quantity.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        barcode: formData.barcode.trim(),
        price: Number(formData.price),
        costPrice: formData.costPrice !== '' ? Number(formData.costPrice) : 0,
        stockQuantity: Number(formData.stockQuantity),
        lowStockThreshold: Number(formData.lowStockThreshold) || 5,
        category: formData.category ? formData.category.trim() : '',
        unit: formData.unit.trim() || 'pcs',
        description: formData.description.trim(),
        isAvailable: formData.isAvailable,
      };

      if (editingItem) {
        const res = await axios.put(`/api/grocery/${editingItem._id}`, payload);
        if (res.data.success) {
          if (payload.category) {
            setCustomCategories((prev) => {
              if (!prev.includes(payload.category)) {
                const next = [...prev, payload.category];
                try {
                  localStorage.setItem('grocery_custom_categories', JSON.stringify(next));
                } catch {}
                return next;
              }
              return prev;
            });
          }
          setItems((prev) =>
            prev.map((it) => (it._id === editingItem._id ? res.data.item : it))
          );
          setModalOpen(false);
        }
      } else {
        const res = await axios.post('/api/grocery', payload);
        if (res.data.success) {
          if (payload.category) {
            setCustomCategories((prev) => {
              if (!prev.includes(payload.category)) {
                const next = [...prev, payload.category];
                try {
                  localStorage.setItem('grocery_custom_categories', JSON.stringify(next));
                } catch {}
                return next;
              }
              return prev;
            });
          }
          setItems((prev) => [res.data.item, ...prev]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}" (Barcode: ${item.barcode})?`)) {
      try {
        const res = await axios.delete(`/api/grocery/${item._id}`);
        if (res.data.success) {
          setItems((prev) => prev.filter((it) => it._id !== item._id));
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete grocery product');
      }
    }
  };

  const copyBarcode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedBarcode(code);
    setTimeout(() => setCopiedBarcode(null), 1500);
  };

  const handleBarcodeLookup = (val) => {
    if (!val) {
      setScannedResult(null);
      return;
    }
    const clean = val.trim().toLowerCase();
    const found = items.find((it) => it.barcode && it.barcode.toLowerCase() === clean);
    setScannedResult(found || 'NOT_FOUND');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#FF6B00]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white font-display tracking-tight flex items-center gap-2">
                Grocery & Retail Items
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold uppercase tracking-wider">
                  Barcode POS Enabled
                </span>
              </h1>
              <p className="text-xs md:text-sm text-neutral-400 mt-0.5">
                Manage packaged products with barcodes, inventory quantities, and instant POS billing deductions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setScannerModalOpen(true);
              setScannerInput('');
              setScannedResult(null);
              setTimeout(() => scannerInputRef.current?.focus(), 150);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[#1C1C24] hover:bg-[#252532] text-neutral-300 hover:text-white border border-[#2B2B38] text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            title="Test Barcode Scanner"
          >
            <Barcode className="w-4 h-4 text-orange-400" />
            <span>Test Scanner</span>
          </button>
          <button
            type="button"
            onClick={fetchGroceryItems}
            className="p-2.5 rounded-xl bg-[#1C1C24] hover:bg-[#252532] text-neutral-400 hover:text-white border border-[#2B2B38] transition-all"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] hover:from-[#E55A00] hover:to-[#FF6B00] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Grocery Item</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Total Products</span>
            <PackageCheck className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-black text-white font-display">{metrics.totalProducts}</p>
          <p className="text-[11px] text-neutral-500">Catalog SKUs</p>
        </div>

        <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-display">{metrics.lowStockCount}</p>
          <p className="text-[11px] text-neutral-500">Need restock soon</p>
        </div>

        <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Out of Stock</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-500 font-display">{metrics.outOfStockCount}</p>
          <p className="text-[11px] text-neutral-500">0 units left</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by product name, barcode (scan or type), category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1C1C24] border border-[#2A2A38] focus:border-[#FF6B00] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 outline-none transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#1C1C24] border border-[#2A2A38] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-xs text-neutral-300 outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#16161D] text-white">
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <div className="flex items-center bg-[#1C1C24] p-1 rounded-xl border border-[#2A2A38] shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setStockFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                stockFilter === 'ALL'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('IN_STOCK')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                stockFilter === 'IN_STOCK'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              In Stock
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('LOW_STOCK')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                stockFilter === 'LOW_STOCK'
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Low ({metrics.lowStockCount})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('OUT_OF_STOCK')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                stockFilter === 'OUT_OF_STOCK'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Empty ({metrics.outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141418] border border-[#24242E] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-[#181820] text-neutral-400 uppercase text-[11px] font-bold border-b border-[#24242E] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Barcode / SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (LKR)</th>
                <th className="py-3.5 px-4">Stock Quantity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20202A]">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-neutral-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mx-auto mb-2" />
                    <span>Loading grocery products...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-neutral-400">
                    <ShoppingBag className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-neutral-300">No grocery products found</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {search
                        ? `No items matched "${search}"`
                        : 'Click "Add Grocery Item" to add your first item.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const qty = Number(item.stockQuantity) || 0;
                  const thresh = Number(item.lowStockThreshold) || 5;
                  const isOut = qty <= 0;
                  const isLow = qty > 0 && qty <= thresh;

                  return (
                    <tr key={item._id} className="hover:bg-[#1A1A22] transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm group-hover:text-orange-400 transition-colors">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1C1C24] border border-[#2B2B38] text-neutral-300 group-hover:border-orange-500/40 transition-colors">
                          <Barcode className="w-3.5 h-3.5 text-orange-400" />
                          <span className="font-semibold text-xs tracking-wider">{item.barcode}</span>
                          <button
                            type="button"
                            onClick={() => copyBarcode(item.barcode)}
                            className="text-neutral-500 hover:text-white ml-1 transition-colors"
                            title="Copy Barcode"
                          >
                            {copiedBarcode === item.barcode ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#22222E] text-neutral-300 border border-[#2D2D3D]">
                          {item.category || '—'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-white font-extrabold text-sm font-display">
                          Rs. {Number(item.price).toLocaleString()}
                        </div>
                        {Number(item.costPrice) > 0 && (
                          <div className="text-[10px] text-neutral-500">
                            Cost: Rs. {Number(item.costPrice).toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-xl text-xs font-black font-display border ${
                            isOut
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : isLow
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {qty} {item.unit || 'pcs'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#282838] text-neutral-400 hover:text-white border border-[#2B2B38] transition-all"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-[#2B2B38] hover:border-rose-500/40 transition-all"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 border-t border-[#24242E] bg-[#16161D] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div>
            Showing <strong className="text-white">{filteredItems.length}</strong> of{' '}
            <strong className="text-white">{items.length}</strong> total products
          </div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Real-time POS stock auto-sync enabled</span>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#16161D] border border-[#2B2B38] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 md:p-5 border-b border-[#24242E] flex items-center justify-between bg-[#191922]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-display">
                    {editingItem ? 'Edit Grocery Item' : 'Add New Grocery Item'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Product barcode, retail price, and starting quantity
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#22222E] hover:bg-[#2C2C3C] text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Product Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mineral Water 500ml, Coca Cola Can"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Barcode / SKU <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateBarcode}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Barcode</span>
                  </button>
                </div>
                <div className="relative">
                  <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    required
                    placeholder="Scan with barcode scanner or enter digits..."
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono font-semibold text-white placeholder-neutral-500 outline-none transition-colors"
                  />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  You can scan with your handheld USB barcode scanner directly into this field.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Selling Price (LKR) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="e.g. 150"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Cost Price (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 100"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Stock Quantity <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 50"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="pcs">pcs</option>
                    <option value="bottle">bottle</option>
                    <option value="can">can</option>
                    <option value="pack">pack</option>
                    <option value="bar">bar</option>
                    <option value="box">box</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Category{' '}
                    <span className="text-neutral-500 font-normal lowercase">(optional)</span>
                  </label>
                  {!showNewCatInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCatInput(true);
                        setNewCatName('');
                      }}
                      className="text-[11px] text-[#FF6B00] hover:text-[#FFA04D] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{formCategories.length === 0 ? 'Create Category' : 'Add New Category'}</span>
                    </button>
                  )}
                </div>

                {showNewCatInput || formCategories.length === 0 ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter category name (optional)..."
                      value={newCatName || formData.category}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        setFormData((prev) => ({ ...prev, category: e.target.value }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewCategory();
                        }
                      }}
                      autoFocus={showNewCatInput}
                      className="flex-1 bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-all shadow-sm"
                    />
                    {newCatName.trim() && (
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] hover:from-[#E55A00] hover:to-[#FF6B00] text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
                      >
                        Save
                      </button>
                    )}
                    {formCategories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCatInput(false);
                          setNewCatName('');
                        }}
                        className="px-3 py-2.5 rounded-xl bg-[#22222E] hover:bg-[#2B2B38] text-neutral-400 hover:text-white text-xs font-bold transition-colors shrink-0"
                      >
                        Select Existing
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === '__ADD_NEW__') {
                          setShowNewCatInput(true);
                          setNewCatName('');
                        } else {
                          setFormData({ ...formData, category: e.target.value });
                        }
                      }}
                      className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#181822] text-neutral-400">
                        -- No Category (Optional) --
                      </option>
                      {formCategories.map((c) => (
                        <option key={c} value={c} className="bg-[#181822] text-white">
                          {c}
                        </option>
                      ))}
                      <option
                        value="__ADD_NEW__"
                        className="bg-[#241711] text-orange-400 font-bold"
                      >
                        + Add New Category...
                      </option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">
                      ▼
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#24242E] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#22222E] hover:bg-[#2B2B38] text-neutral-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] hover:from-[#E55A00] hover:to-[#FF6B00] text-white text-xs font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? 'Update Product' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Scanner Modal */}
      {scannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#16161D] border border-[#2B2B38] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#24242E] flex items-center justify-between bg-[#191922]">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-black text-white font-display">
                  Barcode Scanner Test
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setScannerModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#22222E] text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-neutral-400">
                Point your handheld USB / Bluetooth barcode scanner at any product barcode to test scanning.
              </p>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Scan Barcode
                </label>
                <div className="relative">
                  <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
                  <input
                    ref={scannerInputRef}
                    type="text"
                    placeholder="Scan barcode now..."
                    value={scannerInput}
                    onChange={(e) => {
                      setScannerInput(e.target.value);
                      handleBarcodeLookup(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleBarcodeLookup(scannerInput);
                      }
                    }}
                    className="w-full bg-[#1C1C24] border-2 border-orange-500/50 focus:border-[#FF6B00] rounded-xl pl-9 pr-4 py-3 text-sm font-mono text-white placeholder-neutral-500 outline-none shadow-lg shadow-orange-500/10"
                  />
                </div>
              </div>

              {scannedResult === 'NOT_FOUND' && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>No product found matching barcode "{scannerInput}".</span>
                </div>
              )}

              {scannedResult && scannedResult !== 'NOT_FOUND' && (
                <div className="p-4 rounded-xl bg-[#1C1C24] border border-emerald-500/30 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Product Verified
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      Stock: {scannedResult.stockQuantity} {scannedResult.unit || 'pcs'}
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-white font-display">
                    {scannedResult.name}
                  </p>
                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-[#2B2B38]">
                    <span>Category: {scannedResult.category || '—'}</span>
                    <span className="text-white font-black text-sm">
                      Rs. {Number(scannedResult.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setScannerInput('');
                    setScannedResult(null);
                    scannerInputRef.current?.focus();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#22222E] hover:bg-[#2B2B38] text-neutral-300 text-xs font-bold"
                >
                  Clear & Scan Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryManagement;
