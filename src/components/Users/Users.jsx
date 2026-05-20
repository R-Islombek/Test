import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users as UsersIcon, ShieldAlert, ShieldCheck, 
  Search, RefreshCw, Download, UserCheck, UserX, Shield
} from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'ACTIVE', 'BLOCKED'

  const BASE_URL = 'http://45.138.159.253:9099';

  const getAuthHeader = () => {
    const token = localStorage.getItem('token'); 
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/admin/users`, getAuthHeader());
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId, currentStatus) => {
    const isBlocked = currentStatus === 'BLOCKED';
    if (window.confirm(isBlocked ? "Are you sure you want to unblock this user?" : "Are you sure you want to block this user?")) {
      try {
        if (isBlocked) {
          await axios.patch(`${BASE_URL}/api/admin/users/${userId}`, { status: 'ACTIVE' }, getAuthHeader());
        } else {
          await axios.delete(`${BASE_URL}/api/admin/users/${userId}`, getAuthHeader());
        }
        fetchUsers();
      } catch (err) {
        alert("An error occurred");
      }
    }
  };

  const handleUpdateRole = async (userId, currentRole) => {
    const newRole = prompt("Enter new role (ADMIN / USER):", currentRole);
    if (!newRole) return;
    try {
      await axios.patch(`${BASE_URL}/api/admin/users/${userId}`, { role: newRole.toUpperCase() }, getAuthHeader());
      fetchUsers();
    } catch (err) {
      alert("An error occurred");
    }
  };

  // Filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const userStatus = user.status || 'ACTIVE';
    const matchesTab = 
      activeTab === 'ALL' || 
      (activeTab === 'ACTIVE' && userStatus === 'ACTIVE') || 
      (activeTab === 'BLOCKED' && userStatus === 'BLOCKED');

    return matchesSearch && matchesTab;
  });

  if (loading) return <div className="p-6 text-center text-slate-500 flex justify-center items-center gap-2"><RefreshCw className="animate-spin" /> Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      
      {/* Title and Search Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Shield className="text-teal-500" size={20} /> Admin Panel
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Professional user management cards</p>
          </div>
          
          {/* Tab buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button onClick={() => setActiveTab('ALL')} className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
              All ({users.length})
            </button>
            <button onClick={() => setActiveTab('ACTIVE')} className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'ACTIVE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>
              Active ({users.filter(u => (u.status || 'ACTIVE') === 'ACTIVE').length})
            </button>
            <button onClick={() => setActiveTab('BLOCKED')} className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'BLOCKED' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>
              Blocked ({users.filter(u => u.status === 'BLOCKED').length})
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* 📋 LIST (CARD) VIEW */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4 space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">List View</p>
        
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isBlocked = user.status === 'BLOCKED';
            // Extract the first letter for the avatar
            const firstLetter = user.username ? user.username.charAt(0).toUpperCase() : 'U';

            return (
              <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100/80 gap-4 transition-all">
                
                {/* Left side: Avatar and Info */}
                <div className="flex items-center gap-4">
                  {/* Round letter avatar */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-sm shrink-0 ${
                    user.role === 'ADMIN' ? 'bg-purple-500' : 'bg-teal-500'
                  }`}>
                    {firstLetter}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-800 text-sm">{user.username}</h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                    
                    {/* Status badge dot */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase">{user.status || 'ACTIVE'}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <button
                    onClick={() => handleUpdateRole(user.id, user.role)}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    🔄 Change Role
                  </button>
                  
                  <button
                    onClick={() => handleToggleBlock(user.id, user.status)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                      isBlocked 
                        ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200' 
                        : 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100'
                    }`}
                  >
                    {isBlocked ? (
                      <><UserCheck size={14} /> Unblock</>
                    ) : (
                      <><UserX size={14} /> Block</>
                    )}
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">No users found.</div>
        )}
      </div>

    </div>
  );
};

export default Users;