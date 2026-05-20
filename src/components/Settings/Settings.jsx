import React, { useState, useEffect } from 'react';
import { X, Shield, Settings, Loader2, Eye, EyeOff, Globe, Palette } from 'lucide-react';
import api from '../../api/axiosInstance'; // Axios instance yo'li

const SettingsModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false });
  
  // 🌓 State'larni dastlab localStorage'dan o'qib olamiz
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  // 🔄 Theme o'zgarganda HTML elementga 'dark' klassini qo'shish/o'chirish
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 🌐 Til o'zgarganda uni saqlab qo'yish
  useEffect(() => {
    localStorage.setItem('lang', lang);
    // Agar loyihangizda i18next bo'lsa, shu yerda i18n.changeLanguage(lang) qilish mumkin
  }, [lang]);

  if (!isOpen) return null;

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const settingsData = Object.fromEntries(formData.entries());

    try {
      // 🔐 Haqiqiy API so'rovi (Parolni yangilash uchun)
      if (settingsData.currentPassword && settingsData.newPassword) {
        await api.post('/api/user/change-password', {
          currentPassword: settingsData.currentPassword,
          newPassword: settingsData.newPassword
        });
      }

      setLoading(false);
      alert(lang === 'uz' ? "Sozlamalar muvaffaqiyatli saqlandi!" : "Settings successfully saved!");
      onClose(); // Modalni yopish
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || 
                       (lang === 'uz' ? "Xatolik yuz berdi" : "Failed to update settings.");
      alert(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 🌫️ Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200" 
        onClick={() => !loading && onClose()}
      ></div>

      {/* ⚪️ Light / 🔵 Dark rejimga moslashuvchan Modal Box */}
      <form 
        onSubmit={handleUpdateSettings} 
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
              <Settings size={14} />
            </div>
            {lang === 'uz' ? 'Tizim Sozlamalari' : 'Account Settings'}
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-lg p-3 text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed">
            🛡️ {lang === 'uz' ? 'Xavfsizlik eslatmasi: Yangi parolingiz ishonchli ekanligiga ishonch hosil qiling.' : 'Security Notice: Ensure your new password is secure and not used on other platforms.'}
          </div>
          
          <div className="grid grid-cols-1 gap-3.5">
            
            {/* Current Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-0.5">
                {lang === 'uz' ? 'Joriy Parol' : 'Current Password'}
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3b5998] transition-colors">
                  <Shield size={14} />
                </div>
                <input
                  name="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-[#3b5998]/50 dark:focus:border-[#3b5998] focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-700 dark:text-slate-200 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword.current ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* New Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-0.5">
                {lang === 'uz' ? 'Yangi Parol' : 'New Password'}
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3b5998] transition-colors">
                  <Shield size={14} />
                </div>
                <input
                  name="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  placeholder={lang === 'uz' ? "Kamida 8 ta belgi" : "Minimum 8 characters"}
                  className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-[#3b5998]/50 dark:focus:border-[#3b5998] focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-700 dark:text-slate-200 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword.new ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* System Theme Select */}
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                <Palette size={11} /> {lang === 'uz' ? 'Tizim Mavzusi' : 'System Theme'}
              </label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-700 dark:text-slate-200 font-medium focus:border-[#3b5998]/50 focus:bg-white dark:focus:bg-slate-800 transition-all"
              >
                <option value="light">☀️ {lang === 'uz' ? 'Yorug‘ Mavzu' : 'Light Theme'}</option>
                <option value="dark">🌙 {lang === 'uz' ? 'Qorong‘u Mavzu' : 'Dark Theme'}</option>
              </select>
            </div>

            {/* Language Preferences */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                <Globe size={11} /> {lang === 'uz' ? 'Til Sozlamalari' : 'Language Preferences'}
              </label>
              <select 
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-700 dark:text-slate-200 font-medium focus:border-[#3b5998]/50 focus:bg-white dark:focus:bg-slate-800 transition-all"
              >
                <option value="en">English</option>
                <option value="uz">O'zbekcha</option>
              </select>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-3.5 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {lang === 'uz' ? 'Bekor qilish' : 'Cancel'}
          </button>
          <button
            disabled={loading}
            type="submit"
            className="px-4 py-1.5 bg-[#3b5998] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : (lang === 'uz' ? 'Saqlash' : 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsModal;