import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, ChevronDown, User, Settings,
  LogOut, Camera, SearchX, Shield, X, Mail, Globe, Loader2,
  Calendar
} from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import authService from '../../api/authService';
import SettingsModal from '../Settings/Settings'; // 🔌 Settings modal component

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL-da qidiruv so'zi bo'lsa, input ichiga o'sha qiymatni boshlang'ich holatda qo'yamiz
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    fullName: 'Komila Code',
    email: 'komila@frontera.uz',
    role: 'Super Admin',
    avatar: "https://ui-avatars.com/api/?name=Komila+Code&background=3b5998&color=fff",
    location: 'Toshkent, Uzbekistan'
  });

  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) setUser(prev => ({ ...prev, ...savedUser }));
  }, []);

  // Tashqi sahifalardan o'tganda input tozalanishi yoki yangilanishi uchun kuzatamiz
  useEffect(() => {
    setSearchValue(searchParams.get('q') || '');
  }, [location.pathname]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const updatedData = Object.fromEntries(formData.entries());
      setUser(prev => ({ ...prev, ...updatedData }));
      localStorage.setItem('user', JSON.stringify({ ...user, ...updatedData }));
      setTimeout(() => {
        setLoading(false);
        setActiveModal(null);
      }, 1000);
    } catch (error) {
      setLoading(false);
      alert("An error occurred");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedUser = { ...user, avatar: reader.result };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        loading && setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const debouncedSearch = useDebounce(searchValue, 500);

  // URL-dagi q parametrini doimiy yangilab borish mexanizmi
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      newParams.set('q', debouncedSearch);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname.split('/').filter(Boolean).pop();
    return path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Dashboard';
  };

  const getFormattedDate = () => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs px-4 py-2.5 lg:px-6 transition-all duration-300">
        <div className="w-full flex items-center justify-between mx-auto">

          {/* Chap tomon: Sahifa nomi va sana */}
          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">{getPageTitle()}</h2>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-0.5 uppercase">Control Panel</p>
            </div>
            
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 text-xs font-semibold shadow-3xs">
              <Calendar size={14} className="text-slate-400" />
              <span>{getFormattedDate()}</span>
            </div>
          </div>

          {/* Markaz: Qidiruv tizimi */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3b5998] transition-colors" size={15} />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-9 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#3b5998]/60 focus:ring-4 focus:ring-[#3b5998]/5 rounded-lg outline-none transition-all text-xs text-slate-700 placeholder:text-slate-400 font-medium"
              />
              {searchValue && (
                <button onClick={() => setSearchValue('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-md text-slate-400 transition-colors">
                  <SearchX size={13} />
                </button>
              )}
            </div>
          </div>

          {/* O'ng tomon: Bildirishnomalar va Profil */}
          <div className="flex items-center gap-3.5">
            <IconButton icon={<Bell size={16} />} count={3} />
            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2.5 p-1 rounded-lg transition-all ${isOpen ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
              >
                <img src={user.avatar} className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-3xs" alt="Profile" />
                
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-700 leading-none">{user.fullName.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 tracking-wide">Admin</p>
                </div>
                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 bg-slate-50 rounded-lg mb-1 border border-slate-100">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Account Info</p>
                    <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">{user.email}</p>
                  </div>
                  <div className="space-y-0.5">
                    <DropdownItem icon={<User size={14} />} label="My Profile" onClick={() => { setActiveModal('profile'); setIsOpen(false); }} />
                    <DropdownItem icon={<Shield size={14} />} label="Security" onClick={() => { setIsSettingsOpen(true); setIsOpen(false); }} />
                    <DropdownItem icon={<Settings size={14} />} label="Settings" onClick={() => { setIsSettingsOpen(true); setIsOpen(false); }} />
                  </div>
                  <div className="mt-1 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => { authService.logout(); navigate('/login'); }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all font-bold text-xs"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profil Tahrirlash Modali */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200" onClick={() => !loading && setActiveModal(null)}></div>

          <form onSubmit={handleProfileUpdate} className="relative bg-white border border-slate-200 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                  <User size={14} />
                </div>
                Profile Details
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-md text-slate-400 transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative group cursor-pointer">
                  <div className={`relative ${loading ? 'opacity-40' : ''}`}>
                    <img src={user.avatar} className="w-16 h-16 rounded-full border border-slate-200 object-cover shadow-md ring-4 ring-slate-50" alt="Avatar" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-0 right-0 p-1.5 bg-[#3b5998] text-white rounded-full shadow-md hover:bg-blue-700 transition-all z-10 border border-white"
                    >
                      <Camera size={11} />
                    </button>
                  </div>
                  {loading && <Loader2 className="absolute inset-0 m-auto animate-spin text-[#3b5998]" size={20} />}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                <InputGroup name="fullName" label="Full Name" defaultValue={user.fullName} icon={<User size={14} />} />
                <InputGroup name="email" label="Email Address" defaultValue={user.email} icon={<Mail size={14} />} />
                <InputGroup name="location" label="Location" defaultValue={user.location} icon={<Globe size={14} />} />
              </div>
            </div>

            <div className="p-3 bg-slate-50 flex justify-end gap-2 border-t border-slate-100">
              <button type="button" onClick={() => setActiveModal(null)} className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                Cancel
              </button>
              <button
                disabled={loading}
                type="submit"
                className="px-4 py-1.5 bg-[#3b5998] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

const IconButton = ({ icon, count }) => (
  <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 bg-slate-50 rounded-lg transition-all relative">
    {icon}
    {count > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white shadow-xs">
        {count}
      </span>
    )}
  </button>
);

const DropdownItem = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all text-xs font-semibold group">
    <span className="text-slate-400 group-hover:text-slate-600 transition-colors">{icon}</span>
    {label}
  </button>
);

const InputGroup = ({ label, name, defaultValue, icon, readOnly = false }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">{label}</label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3b5998] transition-colors">{icon}</div>
      <input
        name={name}
        readOnly={readOnly}
        type="text"
        defaultValue={defaultValue}
        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-[#3b5998]/50 focus:bg-white outline-none text-slate-700 transition-all font-medium"
      />
    </div>
  </div>
);

export default Nav;