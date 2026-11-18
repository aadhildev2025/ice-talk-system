import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  UserCheck,
  RefreshCw,
  UserPlus,
  Star,
  ShoppingBag,
  TrendingUp,
  Search,
  X,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
} from 'lucide-react';

const CustomersManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, REGULAR, NEW
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    isRegular: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/customers');
      if (res.data.success) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      isRegular: false,
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
      isRegular: !!customer.isRegular,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Customer name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCustomer) {
        const res = await axios.put(`/api/customers/${editingCustomer._id}`, formData);
        if (res.data.success) {
          setCustomers((prev) =>
            prev.map((c) => (c._id === editingCustomer._id ? res.data.customer : c))
          );
          setModalOpen(false);
        }
      } else {
        const res = await axios.post('/api/customers', formData);
        if (res.data.success) {
          setCustomers((prev) => [res.data.customer, ...prev]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}"?`)) {
      try {
        const res = await axios.delete(`/api/customers/${id}`);
        if (res.data.success) {
          setCustomers((prev) => prev.filter((c) => c._id !== id));
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting customer');
      }
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filter === 'REGULAR') return c.isRegular;
    if (filter === 'NEW') return !c.totalOrders || c.totalOrders <= 1;
    return true;
  });

  const totalCustomers = customers.length;
  const regularCount = customers.filter((c) => c.isRegular).length;
  const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const totalSales = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0F0F12] text-white overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-6 border-b border-[#24242E] bg-[#141418] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-white">
                Customer Management
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage registered patrons, takeaway clients, loyalty and contact information
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchCustomers}
            className="p-2.5 bg-[#1C1C24] hover:bg-[#252532] text-neutral-300 hover:text-white rounded-xl border border-[#2B2B38] transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6B00] text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-[#ea6100] transition-all text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {totalCustomers}
              </span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[11px] text-neutral-500 mt-1">In local POS database</span>
          </div>

          <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Regular Patrons
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                {regularCount}
              </span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[11px] text-neutral-500 mt-1">Loyal / Frequent guests</span>
          </div>

          <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {totalOrders}
              </span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[11px] text-neutral-500 mt-1">Fulfilled customer orders</span>
          </div>

          <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Total Customer Sales
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl sm:text-2xl font-extrabold text-orange-400">
                Rs. {totalSales.toLocaleString()}
              </span>
              <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[11px] text-neutral-500 mt-1">Lifetime customer revenue</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by customer name, phone number, address or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1C1C24] text-white pl-10 pr-4 py-2.5 rounded-xl border border-[#2B2B38] focus:outline-none focus:border-orange-500 text-sm placeholder-neutral-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'REGULAR', 'NEW'].map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  filter === k
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-[#1C1C24] text-neutral-400 hover:text-white hover:bg-[#252532] border border-[#2B2B38]'
                }`}
              >
                {k === 'ALL' && 'All Customers'}
                {k === 'REGULAR' && 'Regulars ⭐'}
                {k === 'NEW' && 'Recent / New'}
              </button>
            ))}
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-[#141418] border border-[#24242E] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#181820] text-neutral-400 text-xs uppercase tracking-wider border-b border-[#24242E]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Customer Details</th>
                  <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                  <th className="py-3.5 px-4 font-semibold">Address / Area</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Orders</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Total Spent</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Last Active</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24242E]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-neutral-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-400 mb-2" />
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-neutral-500">
                      <UserCheck className="w-8 h-8 mx-auto text-neutral-600 mb-2 opacity-50" />
                      No customers found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust._id} className="hover:bg-[#1C1C24]/60 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#242432] border border-[#323246] flex items-center justify-center font-bold text-orange-400 text-sm shrink-0">
                            {cust.name ? cust.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-sm">
                                {cust.name}
                              </span>
                              {cust.isRegular && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" /> Regular
                                </span>
                              )}
                            </div>
                            {cust.notes && (
                              <p className="text-[11px] text-neutral-400 line-clamp-1 italic mt-0.5">
                                "{cust.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {cust.phone ? (
                            <a
                              href={`tel:${cust.phone}`}
                              className="text-xs text-orange-400 hover:underline flex items-center gap-1 font-medium"
                            >
                              <Phone className="w-3 h-3 text-neutral-400" />
                              {cust.phone}
                            </a>
                          ) : (
                            <span className="text-neutral-500 text-xs italic">No phone</span>
                          )}
                          {cust.email && (
                            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-neutral-500" />
                              {cust.email}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-neutral-300">
                        {cust.address ? (
                          <div className="flex items-start gap-1 max-w-[180px]">
                            <MapPin className="w-3 h-3 text-neutral-400 shrink-0 mt-0.5" />
                            <span className="truncate">{cust.address}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-500 italic">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-[#242432] text-xs font-bold text-neutral-200">
                          {cust.totalOrders || 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-orange-400 text-sm">
                        Rs. {(cust.totalSpent || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs text-neutral-400">
                        {cust.lastOrderDate ? (
                          new Date(cust.lastOrderDate).toLocaleDateString()
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 rounded-lg bg-[#242432] hover:bg-orange-500 hover:text-white text-neutral-300 transition-colors"
                            title="Edit Customer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cust._id, cust.name)}
                            className="p-1.5 rounded-lg bg-[#242432] hover:bg-red-500/20 hover:text-red-400 text-neutral-400 transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#141418] border border-[#2B2B38] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#24242E] flex items-center justify-between bg-[#181820]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white font-display">
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#252532]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Perera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#1C1C24] text-white px-3.5 py-2.5 rounded-xl border border-[#2B2B38] focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0771234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#1C1C24] text-white px-3.5 py-2.5 rounded-xl border border-[#2B2B38] focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. kasun@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#1C1C24] text-white px-3.5 py-2.5 rounded-xl border border-[#2B2B38] focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Delivery Address / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. 45 Beach Road, Negombo"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#1C1C24] text-white px-3.5 py-2.5 rounded-xl border border-[#2B2B38] focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Preferences / Special Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Likes extra spicy, prefers avocado shake with less sugar"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#1C1C24] text-white px-3.5 py-2.5 rounded-xl border border-[#2B2B38] focus:outline-none focus:border-orange-500 text-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isRegular"
                  checked={formData.isRegular}
                  onChange={(e) => setFormData({ ...formData, isRegular: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-500 bg-[#1C1C24] border-[#2B2B38] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor="isRegular"
                  className="text-xs font-semibold text-neutral-300 cursor-pointer select-none"
                >
                  Mark as Regular / VIP Customer ⭐
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#24242E]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white bg-[#1C1C24] hover:bg-[#252532] text-xs font-semibold border border-[#2B2B38] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersManagement;
