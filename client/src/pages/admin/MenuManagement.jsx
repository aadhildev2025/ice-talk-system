import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Flame,
  Layers,
  X,
  Power,
} from 'lucide-react';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Rice',
    department: 'KITCHEN',
    image: '',
    prepTimeMinutes: 10,
    isPopular: false,
    isAvailable: true,
  });

  const [newCategoryName, setNewCategoryName] = useState('');

  const { socket } = useSocket();

  const fetchMenuData = async () => {
    try {
      const [resMenu, resCat] = await Promise.all([
        axios.get('/api/menu'),
        axios.get('/api/menu/categories/all'),
      ]);
      if (resMenu.data.success) {
        setMenuItems(resMenu.data.items);
      }
      if (resCat.data.success) {
        setCategories(resCat.data.categories);
      }
    } catch (err) {
      console.error('Error loading menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();

    if (socket) {
      socket.on('menu:updated', () => fetchMenuData());
    }

    return () => {
      if (socket) {
        socket.off('menu:updated');
      }
    };
  }, [socket]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: categories.length > 0 ? categories[1]?.name || 'Rice' : 'Rice',
      department: 'KITCHEN',
      image: '',
      prepTimeMinutes: 10,
      isPopular: false,
      isAvailable: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      department: item.department || 'KITCHEN',
      image: item.image || '',
      prepTimeMinutes: item.prepTimeMinutes || 10,
      isPopular: !!item.isPopular,
      isAvailable: item.isAvailable,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingItem) {
        await axios.put(`/api/menu/${editingItem._id}`, formData);
      } else {
        await axios.post('/api/menu', formData);
      }
      setModalOpen(false);
      fetchMenuData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save menu item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await axios.patch(`/api/menu/${item._id}/toggle-availability`);
      fetchMenuData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle availability');
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) {
      try {
        await axios.delete(`/api/menu/${item._id}`);
        fetchMenuData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete menu item');
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await axios.post('/api/categories', { name: newCategoryName.trim() });
      setNewCategoryName('');
      setCategoryModalOpen(false);
      fetchMenuData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleSyncDefaultMenu = async () => {
    if (window.confirm('Sync or restore default Ice Talk restaurant menu items into MongoDB?')) {
      try {
        const res = await axios.post('/api/menu/seed-default');
        alert(res.data.message || 'Default menu verified and synced successfully!');
        fetchMenuData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to sync default menu');
      }
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDept = selectedDept === 'ALL' || item.department === selectedDept;
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesDept && matchesSearch;
  });

  const departments = ['ALL', 'KITCHEN', 'JUICE', 'BUN', 'OTHER'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141419] p-5 rounded-2xl border border-[#24242E]">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-display flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-orange-400" />
            <span>Menu & Departments Management</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage restaurant dishes, categories, live availability, and preparation departments (Kitchen, Juice, Bun, Other)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSyncDefaultMenu}
            title="Restore or ensure all default Ice Talk menu items exist in MongoDB"
            className="px-3.5 py-2 rounded-xl bg-[#1C1C24] hover:bg-[#252532] text-xs font-bold text-orange-400 border border-[#2A2A38] transition-all flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Restore Default Menu</span>
          </button>
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1C1C24] hover:bg-[#252532] text-xs font-bold text-neutral-300 border border-[#2A2A38] transition-all"
          >
            + Category
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#E05A00] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold text-neutral-400 uppercase mr-1">Dept:</span>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedDept === dept
                    ? 'bg-[#FF6B00] text-white shadow'
                    : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2B2B38]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, drinks..."
              className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl pl-10 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#24242E] scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-white text-black'
                : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2B2B38]'
            }`}
          >
            All Categories ({menuItems.length})
          </button>
          {categories
            .filter((c) => c.name !== 'All')
            .map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-[#FF6B00] text-white shadow'
                    : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2B2B38]'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>
      </div>

      {/* Menu Items Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center text-neutral-500 text-xs bg-[#141418] border border-[#24242E] rounded-2xl">
          No menu items found matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className={`bg-[#141419] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all group ${
                !item.isAvailable
                  ? 'border-neutral-800 opacity-60'
                  : 'border-[#24242E] hover:border-orange-500/40 hover:shadow-xl'
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Badges Row */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-[#1C1C24] border border-[#2B2B38] text-neutral-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">
                      {item.department}
                    </span>
                    {item.isPopular && (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 font-extrabold px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-amber-400" /> POPULAR
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-black text-sm text-white leading-snug">{item.name}</h3>
                      <p className="text-[10px] text-neutral-400 font-semibold">{item.category}</p>
                    </div>
                    <span className="font-extrabold text-sm text-[#FF6B00] font-display whitespace-nowrap">
                      Rs. {item.price.toLocaleString()}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-[#131317] border-t border-[#24242E] flex items-center justify-between">
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                    item.isAvailable
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {item.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                </button>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#282834] text-neutral-300 hover:text-white border border-[#2B2B38]"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-[#2B2B38] hover:border-rose-500/30"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Menu Item Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#17171C] border border-[#2B2B38] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#24242E] pb-3">
              <h3 className="font-black text-lg text-white">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-300 mb-1 uppercase tracking-wider">
                  Item Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Cheese Chicken Kottu"
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-white placeholder-neutral-500 outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1 uppercase tracking-wider">
                    Price (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="850"
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-white outline-none font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-white outline-none"
                  >
                    {categories
                      .filter((c) => c.name !== 'All')
                      .map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1 uppercase tracking-wider">
                    Department (Preparation)
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-white outline-none font-bold"
                  >
                    <option value="KITCHEN">KITCHEN</option>
                    <option value="JUICE">JUICE</option>
                    <option value="BUN">BUN</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1 uppercase tracking-wider">
                    Prep Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.prepTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, prepTimeMinutes: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients and special preparation notes..."
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl p-2.5 text-white placeholder-neutral-500 outline-none h-20"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-500 focus:ring-0 bg-[#1C1C24] border-[#2D2D3B]"
                  />
                  <span className="font-semibold text-neutral-300">Feature as Popular Item</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-[#1C1C24] border-[#2D2D3B]"
                  />
                  <span className="font-semibold text-neutral-300">Available In Stock</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#24242E]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E05A00] text-white font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#17171C] border border-[#2B2B38] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-black text-lg text-white">Create New Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-300 mb-1 uppercase">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Falooda, Desserts, Pizza"
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-white outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF6B00] text-white font-bold"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
