import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Sparkles,
  QrCode,
  Tag,
  Calendar,
  Building,
  Filter,
  Download,
  X
} from 'lucide-react';
import { useTenant } from '../context/TenantContext.jsx';

const DEFAULT_ASSETS = [
  { id: 'AST-LAB-01', name: 'Digital Optical Microscope 1000x', category: 'Science Lab', location: 'Biology Lab 2', quantity: 12, status: 'Good', lastService: '2026-08-15', condition: 'Optimal', cost: 350 },
  { id: 'AST-IT-04', name: 'Interactive Smartboard 75-inch', category: 'Smart Classroom', location: 'Grade 10-A Room', quantity: 4, status: 'Good', lastService: '2026-09-01', condition: 'Optimal', cost: 1200 },
  { id: 'AST-ROB-09', name: 'Robotics Microcontroller & Sensor Kits', category: 'Robotics & STEM', location: 'Innovation Hub', quantity: 25, status: 'Good', lastService: '2026-09-10', condition: 'Optimal', cost: 85 },
  { id: 'AST-SPT-03', name: 'Basketball & Volleyball Official Nets & Balls', category: 'Sports Arena', location: 'Indoor Gymnasium', quantity: 18, status: 'Maintenance', lastService: '2026-07-20', condition: 'Needs Stringing', cost: 45 },
  { id: 'AST-LAB-14', name: 'Chemical Titration Burette & Glassware Set', category: 'Science Lab', location: 'Chemistry Lab 1', quantity: 30, status: 'Good', lastService: '2026-08-28', condition: 'Cleaned & Calibrated', cost: 28 },
  { id: 'AST-LIB-02', name: 'Automated RFID Library Book Scanner', category: 'Library', location: 'Central Library Desk', quantity: 2, status: 'Good', lastService: '2026-09-12', condition: 'Optimal', cost: 650 }
];

export default function InventoryAssetsView() {
  const { tenant } = useTenant();
  const isMasterSchool = !tenant || tenant.is_master_school || tenant.tenant_id === 'tenant-default' || tenant.subdomain === 'demo';
  const tenantKey = tenant?.tenant_id || 'default';

  const [assets, setAssets] = useState(() => {
    try {
      const saved = localStorage.getItem(`nairee_assets_${tenantKey}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return isMasterSchool ? DEFAULT_ASSETS : [];
  });

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'Science Lab',
    location: 'Chemistry Lab 1',
    quantity: 1,
    cost: '',
    condition: 'Optimal'
  });

  useEffect(() => {
    try {
      localStorage.setItem(`nairee_assets_${tenantKey}`, JSON.stringify(assets));
    } catch {}
  }, [assets, tenantKey]);

  const filteredAssets = assets.filter(a => {
    const matchesCat = categoryFilter === 'all' || a.category === categoryFilter;
    const matchesSearch = !searchQuery || 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!newAsset.name) return;
    const added = {
      id: `AST-${newAsset.category.slice(0, 3).toUpperCase()}-0${assets.length + 1}`,
      name: newAsset.name,
      category: newAsset.category,
      location: newAsset.location,
      quantity: Number(newAsset.quantity) || 1,
      status: 'Good',
      lastService: new Date().toISOString().split('T')[0],
      condition: newAsset.condition || 'Optimal',
      cost: Number(newAsset.cost) || 100
    };
    setAssets([added, ...assets]);
    setShowAddModal(false);
    setNewAsset({
      name: '',
      category: 'Science Lab',
      location: 'Chemistry Lab 1',
      quantity: 1,
      cost: '',
      condition: 'Optimal'
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Infrastructure &amp; Asset Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Science Lab, IT &amp; Campus Asset Tracker
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Track real-time inventory of optical microscopes, smartboards, STEM robotics kits, sports gear, and laboratory glassware with maintenance schedules and QR tagging.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/30 flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Asset</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Registered Items</span>
            <span className="text-2xl font-black text-white mt-1 block">
              {assets.reduce((sum, a) => sum + (Number(a.quantity) || 1), 0)} units
            </span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Asset Valuation</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              ₹{assets.reduce((sum, a) => sum + ((Number(a.cost) || 0) * (Number(a.quantity) || 1)), 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-slate-400 font-semibold block">Condition Health</span>
            <span className="text-2xl font-black text-teal-300 mt-1 block">
              {assets.length > 0 ? `${((assets.filter(a => a.status === 'Good').length / assets.length) * 100).toFixed(1)}% Optimal` : '100% Optimal'}
            </span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-slate-400 font-semibold block">In Maintenance</span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">
              {assets.filter(a => a.status === 'Maintenance').length} Items Active
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search asset name, ID, or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="all">All Departments</option>
            <option value="Science Lab">Science Lab</option>
            <option value="Smart Classroom">Smart Classroom</option>
            <option value="Robotics & STEM">Robotics & STEM</option>
            <option value="Sports Arena">Sports Arena</option>
            <option value="Library">Library</option>
          </select>
        </div>
      </div>

      {/* Table or Empty State */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Asset Records Found</h3>
            <p className="text-xs text-slate-500">
              {searchQuery ? 'No assets match your search query.' : 'No laboratory equipment, IT hardware, or campus assets have been registered yet.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Asset</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Asset ID</th>
                  <th className="py-3.5 px-4">Asset Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Qty</th>
                  <th className="py-3.5 px-4">Unit Cost</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAssets.map(a => (
                  <tr key={a.id} className="hover:bg-teal-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">{a.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{a.name}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {a.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{a.location}</td>
                    <td className="py-3 px-4 font-bold">{a.quantity}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">₹{Number(a.cost || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-500">{a.condition}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 w-fit ${
                        a.status === 'Good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {a.status === 'Good' ? <CheckCircle2 className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                        <span>{a.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD ASSET MODAL */}
      {showAddModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-teal-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Register New School Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3D Printer Ender 3 v2"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Science Lab">Science Lab</option>
                    <option value="Smart Classroom">Smart Classroom</option>
                    <option value="Robotics & STEM">Robotics & STEM</option>
                    <option value="Sports Arena">Sports Arena</option>
                    <option value="Library">Library</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="Innovation Hub Lab 2"
                    value={newAsset.location}
                    onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newAsset.quantity}
                    onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="250"
                    value={newAsset.cost}
                    onChange={(e) => setNewAsset({ ...newAsset, cost: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-md"
                >
                  Add to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
