import React, { useState } from 'react';
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import authService from '../api/authService';

const AuthPage = ({ onLoginSuccess }) => {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Muvaffaqiyat xabari uchun shtat

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Frontend himoyasi: Bo'sh joylarni tozalash
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    const cleanFullName = fullName.trim();

    try {
      if (view === 'login') {
        // 1. Tizimga kirish (Login)
        const res = await authService.login({ 
          email: cleanEmail, 
          password: cleanPassword 
        });
        if (res) onLoginSuccess();
      } else {
        // 2. Ro'yxatdan o'tish (Register)
        await authService.register({ 
          email: cleanEmail, 
          password: cleanPassword, 
          fullName: cleanFullName
        });
        
        // Muvaffaqiyatli tugasa xabar berish va Login oynasiga o'tkazish
        setSuccessMessage("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi tizimga kirishingiz mumkin.");
        setView('login');
        
        // Inputlarni tozalash (Email qoladi, foydalanuvchiga oson bo'lishi uchun)
        setPassword('');
        setFullName('');
      }
    } catch (err) {
      console.error("Xatolik tafsiloti:", err.response?.data);
      
      // Backenddan kelishi mumkin bo'lgan har qanday murakkab xatolarni ushlash
      const serverData = err.response?.data;
      
      if (typeof serverData === 'object' && serverData !== null) {
        // Agar xatolar massiv yoki obyekt ichida kelgan bo'lsa (Validatsiya xatolari)
        const errorMessages = Object.values(serverData).join(', ');
        setError(errorMessages || "Kiritilgan ma'lumotlar formatida xatolik bor.");
      } else {
        // Oddiy string xabarlar uchun
        setError(serverData?.message || "Kutilmagan xatolik yuz berdi. Qaytadan urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Oynani almashtirganda xatoliklarni tozalash funksiyasi
  const toggleView = (targetView) => {
    setView(targetView);
    setError('');
    setSuccessMessage('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans p-4">
      {/* Orqa fon effektlari (Glow) */}
      <div className="absolute top-[-10%] left-[-10%] w-48 h-48 md:w-72 md:h-72 bg-teal-500/10 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 md:w-96 md:h-96 bg-blue-600/10 rounded-full blur-[80px]"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl overflow-hidden shadow-black/50">
          <div className="p-6 sm:p-10">
            
            {/* Sarlavha qismi */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight transition-all">
                {view === 'login' ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-slate-400 text-sm">
                {view === 'login' ? "Enter your details to sign in" : "Join our community today"}
              </p>
            </div>

            {/* Muvaffaqiyatli ro'yxatdan o'tganlik xabari (Success Alert) */}
            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Xatolik xabari (Error Alert) */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 animate-fadeIn">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span className="break-words">{error}</span>
              </div>
            )}

            {/* Forma boshlanishi */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name input (Faqat Register ko'rinishida chiqadi) */}
              {view === 'register' && (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Full Name (e.g., John Doe)" 
                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm"
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
              )}

              {/* Email input */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              {/* Password input */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder={view === 'login' ? "Password" : "Password (min. 8 chars, strong)"} 
                  className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>

              {/* Submit Tugmasi */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:opacity-95 active:scale-[0.99] flex justify-center items-center gap-2 shadow-lg hover:shadow-teal-500/10 mt-6 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>{view === 'login' ? "Login" : "Register"}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Oynani almashtirish tugmasi */}
            <div className="mt-8 text-center">
              <button 
                onClick={() => toggleView(view === 'login' ? 'register' : 'login')}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors underline-offset-4 hover:underline"
              >
                {view === 'login' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Log in"}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;