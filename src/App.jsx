import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import authService from './api/authService';
import Sidebar from './components/Sidebar/Sidebar';
import Nav from './components/Nav/Nav';
import LoginPage from './pages/Login';
import Dashboard from './components/Dashbaroat/Dashbaroat';
import Users from './components/Users/Users';
import Posts from './components/Posts/Posts';
import Comments from './components/Comments/Comments';
import './App.css';

const App = () => {
  const [token, setToken] = useState(authService.getToken());

  useEffect(() => {
    const checkToken = () => setToken(authService.getToken());
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  // 🌓 Sahifa ilk bor yuklanganda localStorage'dagi rejimni tekshirib, HTML'ga o'rnatamiz
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Agar foydalanuvchi tizimga kirmagan bo'lsa
  if (!token) {
    return <LoginPage onLoginSuccess={() => setToken(authService.getToken())} />;
  }

  // Tizimga kirgan bo'lsa (Admin Panel)
  return (
    /* 🔑 SHU YERDA: dark:bg-slate-950 va dark:text-slate-50 klasslarini qo'shdik.
      transition-colors duration-300 esa rejim almashganda fon rangini silliq (animatsiya bilan) o'zgartiradi.
    */
    <div className="flex h-screen bg-[#f0f9f8] dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* Chap tomondagi menyu */}
      <Sidebar />

      {/* O'ng tomondagi asosiy kontent qismi */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <Nav />

        {/* Kontent maydoni: URL-ga qarab faqat bitta sahifani ko'rsatadi */}
        <div className="flex-1 overflow-y-auto mt-4">
          <Routes>
            {/* Asosiy admin sahifasi (Dashboard) */}
            <Route path="/admin" element={<Dashboard />} />

            {/* Foydalanuvchilar sahifasi */}
            <Route path="/admin/users" element={<Users />} />

            <Route path="/admin/posts" element={<Posts />} />

            <Route path="/admin/comments" element={<Comments />} />

            {/* Agar boshqa noto'g'ri URL yozilsa, avtomat /admin-ga yuboradi */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;