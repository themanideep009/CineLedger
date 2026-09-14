import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Users,
  RefreshCw,
  FileText,
  UserPlus,
  Building2,
  CheckCircle2,
  Lock,
  Search,
  AlertOctagon,
  PlusCircle,
} from 'lucide-react';

export const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit', 'users', 'create', 'theatre', 'disputes'
  const [logs, setLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [logFilter, setLogFilter] = useState('');

  // Create User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password] = useState('pass123');
  const [role, setRole] = useState('PRODUCER');
  const [producerCompany, setProducerCompany] = useState('');
  const [userMsg, setUserMsg] = useState('');

  // Register Theatre Form State
  const [theatreName, setTheatreName] = useState('');
  const [village, setVillage] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [assignedAdminId, setAssignedAdminId] = useState('');
  const [theatreMsg, setTheatreMsg] = useState('');

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('cineledger_token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('cineledger_token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
        const theatreAdmins = data.filter((u) => u.role === 'THEATRE_ADMIN');
        if (theatreAdmins.length > 0) setAssignedAdminId(theatreAdmins[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
    fetchUsers();
  }, [fetchAuditLogs, fetchUsers]);

  const handleTriggerSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await fetch('/api/admin/trigger-aggregation', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('cineledger_token')}` },
      });
      const data = await res.json();
      setSyncMsg(data.message);
      await fetchAuditLogs();
    } catch {
      setSyncMsg('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserMsg('');
    try {
      const res = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cineledger_token')}`,
        },
        body: JSON.stringify({ name, email, password, role, producerCompany }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user');

      setUserMsg(`User ${name} created with role ${role}`);
      setName('');
      setEmail('');
      fetchUsers();
      fetchAuditLogs();
    } catch (err) {
      setUserMsg(`Error: ${err.message}`);
    }
  };

  const handleRegisterTheatre = async (e) => {
    e.preventDefault();
    setTheatreMsg('');
    try {
      const res = await fetch('/api/admin/create-theatre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cineledger_token')}`,
        },
        body: JSON.stringify({
          name: theatreName,
          village,
          city,
          district,
          state,
          adminId: assignedAdminId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register theatre');

      setTheatreMsg(`Theatre "${data.theatre.name}" registered successfully!`);
      setTheatreName('');
      setCity('');
      setDistrict('');
      fetchAuditLogs();
    } catch (err) {
      setTheatreMsg(`Error: ${err.message}`);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(logFilter.toLowerCase()) ||
      l.actorName.toLowerCase().includes(logFilter.toLowerCase()) ||
      l.actorRole.toLowerCase().includes(logFilter.toLowerCase())
  );

  const theatreAdmins = usersList.filter((u) => u.role === 'THEATRE_ADMIN');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Super Admin Control Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Full System Access Granted
          </div>
          <h1 className="text-3xl font-extrabold text-white">Super Admin Enterprise Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage users, register cinema properties, trigger external adapter syncs, and monitor immutable audit logs
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={syncing}
          className="px-5 py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing External Adapters...' : 'Trigger Box-Office Aggregation Sync'}
        </button>
      </div>

      {syncMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {syncMsg}
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Immutable Audit Log ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> System Accounts ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'create'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" /> Create User Account
        </button>
        <button
          onClick={() => setActiveTab('theatre')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'theatre'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" /> Register Cinema Property
        </button>
      </div>

      {/* Tab 1: Audit Log Viewer with Search */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-400" /> Tamper-Evident Audit Event Feed
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter logs by action or user..."
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading audit logs...</div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {filteredLogs.map((log) => (
                <div
                  key={log._id}
                  className="glass-card p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded font-mono border border-slate-800">
                        {log.action}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300 font-semibold">{log.actorName}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        {log.actorRole}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Entity: <span className="text-slate-300 font-mono">{log.entityType}</span> ({log.entityId || 'N/A'})
                    </div>
                  </div>

                  <div className="text-slate-400 text-[11px] text-right font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-400" /> Registered System Accounts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersList.map((u) => (
              <div key={u._id} className="glass-card p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{u.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300">
                    {u.role}
                  </span>
                </div>
                <div className="text-slate-400">{u.email}</div>
                {u.producerCompany && (
                  <div className="text-[11px] text-amber-300">Company: {u.producerCompany}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Create User Form */}
      {activeTab === 'create' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-xl mx-auto space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-rose-400" /> Create Admin / Producer Account
          </h2>

          {userMsg && (
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs font-semibold">
              {userMsg}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ramesh Sippy"
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@producer.com"
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Role Assignment</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
              >
                <option value="PRODUCER">PRODUCER (Movie Financials Owner)</option>
                <option value="THEATRE_ADMIN">THEATRE_ADMIN (Theatre Ops & Counter Sales)</option>
              </select>
            </div>

            {role === 'PRODUCER' && (
              <div>
                <label className="block text-slate-300 mb-1">Production House Name</label>
                <input
                  type="text"
                  value={producerCompany}
                  onChange={(e) => setProducerCompany(e.target.value)}
                  placeholder="Sippy Films Pvt Ltd"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-rose-500/20"
            >
              Create Account
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Register Cinema Property Form */}
      {activeTab === 'theatre' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-xl mx-auto space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-400" /> Register Cinema Property
          </h2>

          {theatreMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {theatreMsg}
            </div>
          )}

          <form onSubmit={handleRegisterTheatre} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Theatre Name</label>
              <input
                type="text"
                placeholder="PVR ICON Oberoi Mall"
                value={theatreName}
                onChange={(e) => setTheatreName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Locality / Village</label>
                <input
                  type="text"
                  placeholder="Goregaon East"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">District</label>
                <input
                  type="text"
                  placeholder="Mumbai Suburban"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  placeholder="Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Assign Theatre Admin</label>
              <select
                value={assignedAdminId}
                onChange={(e) => setAssignedAdminId(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
              >
                {theatreAdmins.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Register Theatre & Assign Admin
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
