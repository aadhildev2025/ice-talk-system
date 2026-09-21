import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  ChefHat,
  UtensilsCrossed,
  Search,
  X,
  KeyRound,
} from 'lucide-react';

const StaffManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'waiter',
    department: 'ALL',
    phone: '',
    status: 'ACTIVE',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/auth/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching staff users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'waiter',
      department: 'ALL',
      phone: '',
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: '', // Leave blank unless resetting
      role: user.role,
      department: user.department || 'ALL',
      phone: user.phone || '',
      status: user.status || 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingUser) {
        await axios.put(`/api/auth/users/${editingUser._id}`, formData);
      } else {
        await axios.post('/api/auth/users', formData);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save staff account');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.role === 'superadmin') {
      alert('Cannot delete Super Admin account.');
      return;
    }
    if (user.role === 'admin' && user.username === 'admin') {
      alert('Cannot delete primary Admin.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete staff user "${user.name}"?`)) {
      try {
        await axios.delete(`/api/auth/users/${user._id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141419] p-5 rounded-2xl border border-[#24242E]">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            <span>Staff & Access Management</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage system logins, roles, and department assignments for Waiters, Kitchen, and Juice Staff
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#E05A00] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'superadmin', 'admin', 'waiter'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                roleFilter === r
                  ? 'bg-[#FF6B00] text-white shadow'
                  : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2B2B38]'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r === 'superadmin' ? 'Super Admin' : r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff name..."
            className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl pl-10 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-[#141418] border border-[#24242E] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs">No staff accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1C1C24] text-neutral-400 uppercase text-[10px] tracking-wider border-b border-[#24242E]">
                <tr>
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24242E]">
                {filteredUsers.map((u) => {
                  const isSuperAdmin = u.role === 'superadmin';
                  const isAdmin = u.role === 'admin';
                  const isWaiter = u.role === 'waiter';

                  return (
                    <tr key={u._id} className="hover:bg-[#1A1A22] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSuperAdmin
                                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                                : isAdmin
                                ? 'bg-orange-500/20 text-orange-400'
                                : isWaiter
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{u.name}</p>
                            <p className="text-[10px] text-neutral-400">{u.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-neutral-300 font-semibold">@{u.username}</td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isSuperAdmin
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : isAdmin
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                              : isWaiter
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          {isSuperAdmin ? 'Super Admin' : u.role}
                        </span>
                      </td>

                      <td className="p-4 text-neutral-300 font-semibold uppercase text-[11px]">
                        {u.department || 'ALL'}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Edit / Reset Password"
                            className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#252532] text-neutral-300 hover:text-white border border-[#2B2B38]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={u.username === 'admin' || isSuperAdmin}
                            title="Delete User"
                            className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-[#2B2B38] disabled:opacity-20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#17171C] border border-[#2B2B38] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#24242E] pb-3">
              <h3 className="font-black text-lg text-white">
                {editingUser ? `Edit Staff: ${editingUser.name}` : 'Add New Staff Member'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-300 mb-1 uppercase">Full Name</label>
                <input
                  id="staff-fullname-input"
                  type="text"
                  name="staff_full_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ahmed Kamal"
                  autoComplete="off"
                  autoFocus
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1 uppercase">Username</label>
                <input
                  id="staff-username-input"
                  type="text"
                  name="staff_username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. ahmed"
                  autoComplete="off"
                  disabled={!!editingUser}
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1 uppercase">
                  {editingUser ? 'New Password (leave empty to keep unchanged)' : 'Password'}
                </label>
                <input
                  id="staff-password-input"
                  type="password"
                  name="staff_new_password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                  required={!editingUser}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1 uppercase">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="waiter">Waiter</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1 uppercase">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="ALL">ALL</option>
                    <option value="KITCHEN">KITCHEN</option>
                    <option value="JUICE">JUICE</option>
                    <option value="BUN">BUN</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1 uppercase">Phone Number</label>
                <input
                  id="staff-phone-input"
                  type="text"
                  name="staff_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+94 77 123 4567"
                  autoComplete="off"
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#24242E]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-[#FF6B00] text-white font-bold disabled:opacity-50"
                >
                  {editingUser ? 'Save Staff' : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
