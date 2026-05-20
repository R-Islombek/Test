import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, 
  MessageSquare, Settings, LogOut, Menu, X, Shield 
} from 'lucide-react';
import authService from '../../api/authService';
import SettingsModal from '../Settings/Settings'; // Alohida yaratilgan SettingsModal'ni import qilamiz

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Modal oynani boshqarish uchun state
  const navigate = useNavigate();

  const menuItems = [
    { icon: <LayoutDashboard size={16} />, label: "Dashboard", path: "/admin" },
    { icon: <Users size={16} />, label: "Users", path: "/admin/users" },
    { icon: <FileText size={16} />, label: "Posts", path: "/admin/posts" },
    { icon: <MessageSquare size={16} />, label: "Comments", path: "/admin/comments" },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
    window.location.reload();
  };

  return (
    <>
      {/* 📱 Mobile Toggle Button - Faqat mobil ekranda ko'rinadi */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white text-slate-600 rounded-lg border border-slate-200 shadow-md hover:bg-slate-50 transition-all"
        >
          <Menu size={18} />
        </button>
      )}

      {/* 🌫️ Mobile Overlay (Orqa fon xiralashishi) */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-[50] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`} 
        onClick={() => setIsOpen(false)} 
      />

      {/* ⚪️ WHITE LIGHT SIDEBAR CONTAINER */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-[55] 
        w-60 bg-white text-slate-700 flex flex-col h-screen 
        border-r border-slate-200 transition-transform duration-300 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* 🏷️ Branding Area */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 shrink-0 justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#3b5998] rounded-lg flex items-center justify-center shadow-sm shadow-[#3b5998]/20">
              <Shield size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xs font-black text-slate-800 tracking-wider uppercase leading-none">ConsoleCenter</h1>
              <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tight">Enterprise Suite</p>
            </div>
          </div>
          
          {/* Mobil rejim uchun yopish tugmasi */}
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* 🧭 Navigation - Main Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Main Menu</p>
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 border
                ${isActive 
                  ? 'bg-[#3b5998]/5 text-[#3b5998] border-[#3b5998]/10 font-black' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ⚙️ Footer Navigation: Settings & Logout */}
        <div className="p-3 border-t border-slate-100 space-y-1 shrink-0 bg-slate-50/50">
          <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-1">Management</p>
          
          {/* 🛠️ MODALNI OCHUVCHI SOZLAMALAR TUGMASI (NavLink o'rniga tugma qilindi) */}
          <button 
            onClick={() => {
              setIsOpen(false);         // Mobil menyuni yopadi
              setIsSettingsOpen(true);  // Sozlamalar modalini ochadi
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${
              isSettingsOpen ? 'bg-slate-200 text-slate-900 border-slate-300' : ''
            }`}
          >
            <Settings size={16} className="shrink-0" />
            <span>Settings</span>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* 🎛️ SETTINGS MODAL INTEGRATSIYASI */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default Sidebar;