import React from 'react';
import { 
  LayoutDashboard, Users, MessageSquare, 
  FileText, Settings, LogOut, Search, Bell 
} from 'lucide-react'; // Ikonkalar uchun

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#e0f2f1] font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1a4d4a] text-white flex flex-col m-4 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <span className="text-xl font-bold italic">SocialSphere</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem icon={<Users size={20} />} label="Users" active />
          <NavItem icon={<FileText size={20} />} label="Posts" />
          <NavItem icon={<MessageSquare size={20} />} label="Comments" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-teal-800">
          <NavItem icon={<Settings size={20} />} label="Settings" />
          <NavItem icon={<LogOut size={20} />} label="Logout" />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* NAVBAR */}
        <header className="flex items-center justify-between bg-white/40 backdrop-blur-md p-4 rounded-2xl mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-700">User Management</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="pl-10 pr-4 py-2 bg-white/60 border-none rounded-xl focus:ring-2 focus:ring-teal-500 w-64 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-4 border-l pl-6 border-slate-300">
              <div className="relative">
                <Bell size={22} className="text-slate-600 cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-white"></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">Admin Name</p>
                  <p className="text-xs text-slate-500 font-medium">Avatar</p>
                </div>
                <img 
                  src="https://via.placeholder.com/40" 
                  className="w-10 h-10 rounded-xl border-2 border-white shadow-md"
                  alt="Admin"
                />
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT (Bu yerda jadval va statistika bo'ladi) */}
        <main className="flex-1 overflow-y-auto pr-2">
          {children}
        </main>
      </div>
    </div>
  );
};

// Sidebar elementlari uchun komponent
const NavItem = ({ icon, label, active = false }) => (
  <div className={`
    flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all
    ${active ? 'bg-white/10 text-white shadow-inner' : 'text-teal-100 hover:bg-white/5'}
  `}>
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </div>
);

export default Layout;