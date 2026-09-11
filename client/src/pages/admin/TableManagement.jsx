import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import {
  Grid,
  Plus,
  Edit2,
  Trash2,
  Power,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Layers,
  Building,
  Check,
  Settings2,
  Sparkles,
} from 'lucide-react';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFloors, setLoadingFloors] = useState(true);

  // Table modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('ALL');

  // Floor management modal states
  const [floorModalOpen, setFloorModalOpen] = useState(false);
  const [newFloorInput, setNewFloorInput] = useState('');
  const [editingFloorId, setEditingFloorId] = useState(null);
  const [editingFloorName, setEditingFloorName] = useState('');
  const [floorActionLoading, setFloorActionLoading] = useState(false);

  // Inline floor creation in Table Modal
  const [showInlineAddFloor, setShowInlineAddFloor] = useState(false);
  const [inlineFloorName, setInlineFloorName] = useState('');

  // Form states for table
  const [formData, setFormData] = useState({
    name: '',
    capacity: 4,
    type: 'Family',
    floor: 'Ground Floor',
    sortOrder: 0,
    status: 'AVAILABLE',
  });
  const [formLoading, setFormLoading] = useState(false);

  const { socket } = useSocket();

  // Fetch Tables
  const fetchTables = async () => {
    try {
      const res = await axios.get('/api/tables');
      if (res.data.success) {
        setTables(res.data.tables);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Floors
  const fetchFloors = async () => {
    try {
      const res = await axios.get('/api/tables/floors');
      if (res.data.success) {
        setFloors(res.data.floors);
      }
    } catch (err) {
      console.error('Error fetching floors:', err);
    } finally {
      setLoadingFloors(false);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchFloors();

    if (socket) {
      socket.on('table:updated', () => {
        fetchTables();
        fetchFloors();
      });
      socket.on('order:created', () => fetchTables());
      socket.on('sale:completed', () => fetchTables());
    }

    return () => {
      if (socket) {
        socket.off('table:updated');
        socket.off('order:created');
        socket.off('sale:completed');
      }
    };
  }, [socket]);

  // Available floors list (combines DB floors + any active table floors to ensure none are missed)
  const floorOptions = useMemo(() => {
    const list = [...floors.map((f) => f.name)];
    if (!list.includes('Ground Floor')) list.unshift('Ground Floor');
    tables.forEach((t) => {
      if (t.floor && !list.includes(t.floor)) {
        list.push(t.floor);
      }
    });
    return Array.from(new Set(list));
  }, [floors, tables]);

  // Floor CRUD handlers
  const handleCreateFloor = async (nameToCreate) => {
    const trimmed = (nameToCreate || newFloorInput).trim();
    if (!trimmed) return null;

    setFloorActionLoading(true);
    try {
      const res = await axios.post('/api/tables/floors', { name: trimmed });
      if (res.data.success) {
        await fetchFloors();
        setNewFloorInput('');
        return res.data.floor;
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create floor');
      return null;
    } finally {
      setFloorActionLoading(false);
    }
  };

  const handleUpdateFloor = async (floorId) => {
    const trimmed = editingFloorName.trim();
    if (!trimmed) return;

    setFloorActionLoading(true);
    try {
      const res = await axios.put(`/api/tables/floors/${floorId}`, { name: trimmed });
      if (res.data.success) {
        setEditingFloorId(null);
        setEditingFloorName('');
        await fetchFloors();
        await fetchTables();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to rename floor');
    } finally {
      setFloorActionLoading(false);
    }
  };

  const handleDeleteFloor = async (floor) => {
    const assignedCount = tables.filter((t) => t.floor === floor.name).length;
    const confirmMsg = assignedCount > 0
      ? `Are you sure you want to remove floor "${floor.name}"?\n${assignedCount} table(s) on this floor will be automatically reassigned to "Ground Floor".`
      : `Are you sure you want to remove floor "${floor.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    setFloorActionLoading(true);
    try {
      const res = await axios.delete(`/api/tables/floors/${floor._id}`);
      if (res.data.success) {
        if (selectedFloor === floor.name) {
          setSelectedFloor('ALL');
        }
        await fetchFloors();
        await fetchTables();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove floor');
    } finally {
      setFloorActionLoading(false);
    }
  };

  const handleInlineAddFloorSubmit = async (e) => {
    e.preventDefault();
    if (!inlineFloorName.trim()) return;
    const created = await handleCreateFloor(inlineFloorName.trim());
    if (created) {
      setFormData((prev) => ({ ...prev, floor: created.name }));
      setInlineFloorName('');
      setShowInlineAddFloor(false);
    }
  };

  // Table Modal handlers
  const handleOpenAddModal = () => {
    setEditingTable(null);
    setFormData({
      name: '',
      capacity: 4,
      type: 'Family',
      floor: selectedFloor !== 'ALL' ? selectedFloor : (floorOptions[0] || 'Ground Floor'),
      sortOrder: tables.length + 1,
      status: 'AVAILABLE',
    });
    setShowInlineAddFloor(false);
    setInlineFloorName('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (table) => {
    setEditingTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity,
      type: table.type || 'Family',
      floor: table.floor || 'Ground Floor',
      sortOrder: table.sortOrder || 0,
      status: table.status || 'AVAILABLE',
    });
    setShowInlineAddFloor(false);
    setInlineFloorName('');
    setModalOpen(true);
  };

  const handleSubmitTable = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = {
      name: formData.name,
      capacity: formData.capacity,
      type: formData.type,
      floor: formData.floor || 'Ground Floor',
      sortOrder: formData.sortOrder,
      status: formData.status,
    };

    try {
      if (editingTable) {
        await axios.put(`/api/tables/${editingTable._id}`, payload);
      } else {
        await axios.post('/api/tables', payload);
      }
      setModalOpen(false);
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save table');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (table) => {
    const nextStatus = table.status === 'DISABLED' ? 'AVAILABLE' : 'DISABLED';
    try {
      await axios.put(`/api/tables/${table._id}`, {
        status: nextStatus,
        isActive: nextStatus !== 'DISABLED',
      });
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle table status');
    }
  };

  const handleDeleteTable = async (table) => {
    if (window.confirm(`Are you sure you want to remove table "${table.name}"?`)) {
      try {
        await axios.delete(`/api/tables/${table._id}`);
        fetchTables();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete table');
      }
    }
  };

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchFloor = selectedFloor === 'ALL' || t.floor === selectedFloor;
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.type?.toLowerCase().includes(search.toLowerCase()) ||
        t.floor?.toLowerCase().includes(search.toLowerCase());
      return matchFloor && matchSearch;
    });
  }, [tables, selectedFloor, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141419] p-5 rounded-2xl border border-[#24242E]">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-display flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#FF6B00]" />
            <span>Table Management</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Organize restaurant seating divided by Floor Names, capacity, and real-time statuses
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-52">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search table or floor..."
              className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none"
            />
          </div>

          {/* Manage Floors button */}
          <button
            onClick={() => setFloorModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#1C1C24] hover:bg-[#252532] text-amber-400 border border-amber-500/30 hover:border-amber-500/60 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
            title="Add, Rename or Remove Floors"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Manage Floors</span>
          </button>

          {/* Add Table Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#E05A00] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Floor Divider Filter Bar */}
      <div className="flex items-center justify-between gap-2 bg-[#141418] p-3 rounded-2xl border border-[#24242E] overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
          <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5 mr-1 whitespace-nowrap">
            <Building className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Floor:</span>
          </span>

          <button
            onClick={() => setSelectedFloor('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedFloor === 'ALL'
                ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/20'
                : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2B2B38]'
            }`}
          >
            All Floors ({tables.length})
          </button>

          {floorOptions.map((fl) => {
            const count = tables.filter((t) => t.floor === fl).length;
            return (
              <button
                key={fl}
                onClick={() => setSelectedFloor(fl)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedFloor === fl
                    ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/20'
                    : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2B2B38]'
                }`}
              >
                <span>{fl}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  selectedFloor === fl ? 'bg-white/20 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Add Floor shortcut in bar */}
        <button
          onClick={() => setFloorModalOpen(true)}
          className="p-1.5 rounded-xl bg-[#1C1C24] hover:bg-[#252532] text-neutral-400 hover:text-amber-400 border border-[#2B2B38] transition-all flex items-center gap-1 text-xs px-2.5 whitespace-nowrap shrink-0"
          title="Add / Remove Floors"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-bold hidden md:inline">Floor</span>
        </button>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="bg-[#141418] border border-[#24242E] rounded-3xl p-12 text-center text-neutral-400 space-y-3">
          <Building className="w-10 h-10 mx-auto text-neutral-600" />
          <h3 className="text-sm font-bold text-white">No Tables Found</h3>
          <p className="text-xs text-neutral-500">
            No tables in {selectedFloor === 'ALL' ? 'the restaurant' : selectedFloor}. Click &quot;Add Table&quot; to create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((tbl) => {
            const hasOrder = tbl.hasActiveOrder;
            const isDisabled = tbl.status === 'DISABLED';
            const isOccupied = tbl.status === 'OCCUPIED' || hasOrder;

            return (
              <div
                key={tbl._id}
                className={`bg-[#141419] border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                  isDisabled
                    ? 'border-neutral-800 opacity-60'
                    : isOccupied
                    ? 'border-rose-500/40 bg-gradient-to-br from-[#241414] to-[#141419]'
                    : 'border-[#24242E] hover:border-orange-500/30'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2 gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase flex items-center gap-1">
                        <Building className="w-2.5 h-2.5" />
                        {tbl.floor || 'Ground Floor'}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-400 bg-[#1C1C24] px-1.5 py-0.5 rounded border border-[#2A2A38] uppercase">
                        {tbl.type}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isDisabled
                          ? 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                          : isOccupied
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {isDisabled ? 'Disabled' : isOccupied ? 'Occupied' : 'Available'}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white">{tbl.name}</h3>

                  <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-neutral-500" />
                      {tbl.capacity} Seats
                    </span>
                    {hasOrder && (
                      <span className="text-amber-400 font-bold">
                        Rs. {tbl.activeOrdersTotal?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#24242E] mt-4 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(tbl)}
                    title={isDisabled ? 'Enable Table' : 'Disable Table'}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-semibold transition-colors ${
                      isDisabled
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{isDisabled ? 'Enable' : 'Disable'}</span>
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(tbl)}
                      className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#252532] text-neutral-300 hover:text-white border border-[#2A2A38] transition-colors"
                      title="Rename / Edit Table"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(tbl)}
                      disabled={hasOrder}
                      className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-[#2A2A38] hover:border-rose-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Delete Table"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT TABLE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#17171C] border border-[#2B2B38] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#24242E] pb-3">
              <h3 className="font-black text-lg text-white">
                {editingTable ? 'Edit / Rename Table' : 'Add New Restaurant Table'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTable} className="space-y-4">
              {/* Floor Selection & Management */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Floor Name / Level
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowInlineAddFloor(!showInlineAddFloor)}
                    className="text-[11px] text-[#FF6B00] hover:underline font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showInlineAddFloor ? 'Choose Existing' : '+ Add New Floor'}</span>
                  </button>
                </div>

                {!showInlineAddFloor ? (
                  <div className="flex gap-2">
                    <select
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-xs text-white outline-none font-bold"
                    >
                      {floorOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setFloorModalOpen(true)}
                      className="px-3 bg-[#1C1C24] hover:bg-[#252532] text-neutral-400 hover:text-amber-400 border border-[#2D2D3B] rounded-xl text-xs font-bold flex items-center justify-center shrink-0"
                      title="Manage / Remove Floors"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 bg-[#1C1C24] p-3 rounded-xl border border-orange-500/40">
                    <span className="text-[11px] font-bold text-orange-400">Add New Floor Name:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inlineFloorName}
                        onChange={(e) => setInlineFloorName(e.target.value)}
                        placeholder="e.g. 3rd Floor, Terrace, VIP Suite"
                        className="flex-1 bg-[#141419] border border-[#333344] focus:border-[#FF6B00] rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleInlineAddFloorSubmit}
                        disabled={!inlineFloorName.trim() || floorActionLoading}
                        className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E05A00] text-white text-xs font-bold rounded-lg disabled:opacity-40 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Table Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wider">
                  Table Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Table 01, VIP 01, T-104"
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wider">
                    Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wider">
                    Table Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="Family">Family</option>
                    <option value="VIP">VIP</option>
                    <option value="Couple">Couple</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#24242E]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E05A00] text-white text-xs font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  {editingTable ? 'Save Changes' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGE / ADD / REMOVE FLOORS MODAL */}
      {floorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#17171C] border border-[#2B2B38] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#24242E] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Floor Management</h3>
                  <p className="text-[11px] text-neutral-400">Add, rename, or remove restaurant floor levels</p>
                </div>
              </div>
              <button
                onClick={() => setFloorModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Floor Input */}
            <div className="bg-[#1C1C24] p-4 rounded-xl border border-[#2B2B38] space-y-2">
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Add New Floor Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFloorInput}
                  onChange={(e) => setNewFloorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateFloor();
                    }
                  }}
                  placeholder="e.g. Ground Floor, 1st Floor, Rooftop, Terrace, VIP Lounge"
                  className="flex-1 bg-[#141419] border border-[#333344] focus:border-[#FF6B00] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleCreateFloor()}
                  disabled={!newFloorInput.trim() || floorActionLoading}
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E05A00] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Floor</span>
                </button>
              </div>
            </div>

            {/* List of Configured Floors */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                Existing Floors ({floors.length})
              </span>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {floors.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-500">
                    No custom floors configured yet.
                  </div>
                ) : (
                  floors.map((fl) => {
                    const assignedTables = tables.filter((t) => t.floor === fl.name);
                    const isEditing = editingFloorId === fl._id;

                    return (
                      <div
                        key={fl._id}
                        className="flex items-center justify-between bg-[#141419] border border-[#24242E] rounded-xl px-3.5 py-2.5 hover:border-[#333344] transition-all"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingFloorName}
                              onChange={(e) => setEditingFloorName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateFloor(fl._id);
                              }}
                              className="flex-1 bg-[#1C1C24] border border-[#FF6B00] rounded-lg px-2.5 py-1 text-xs text-white outline-none font-bold"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateFloor(fl._id)}
                              disabled={floorActionLoading}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs"
                              title="Save Name"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingFloorId(null);
                                setEditingFloorName('');
                              }}
                              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                              <Building className="w-3 h-3 text-amber-400" />
                            </div>
                            <span className="font-bold text-xs text-white">{fl.name}</span>
                            <span className="text-[10px] font-semibold text-neutral-400 bg-[#1C1C24] px-2 py-0.5 rounded-full border border-[#2A2A38]">
                              {assignedTables.length} table{assignedTables.length === 1 ? '' : 's'}
                            </span>
                          </div>
                        )}

                        {!isEditing && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingFloorId(fl._id);
                                setEditingFloorName(fl.name);
                              }}
                              className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#252532] text-neutral-400 hover:text-white border border-[#2A2A38] transition-colors"
                              title="Rename Floor"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteFloor(fl)}
                              disabled={floorActionLoading}
                              className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-[#2A2A38] hover:border-rose-500/30 transition-colors"
                              title="Delete Floor"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#24242E]">
              <button
                type="button"
                onClick={() => setFloorModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E05A00] text-white text-xs font-bold shadow-lg shadow-orange-500/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
