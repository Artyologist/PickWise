import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';
import SearchResults from './pages/SearchResults';
import ContentDetail from './pages/ContentDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import RequireAuth from './components/RequireAuth'


import Universe from './pages/Universe';
import Upcoming from './pages/Upcoming';
import UpcomingDetail from './pages/UpcomingDetail';
import Settings from './pages/Settings';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import RequireAdmin from './components/RequireAdmin';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search/:category" element={<SearchResults />} />
          <Route path="/:category" element={<SearchResults />} />
          <Route path="/content/:id" element={<ContentDetail />} />
          <Route path="/universe/:name" element={<Universe />} />
          <Route path="/upcoming" element={<Upcoming />} />
          <Route path="/upcoming/:slug" element={<UpcomingDetail />} />

          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<RequireAuth> <Profile /> </RequireAuth>} />
          <Route path="/settings" element={<RequireAuth> <Settings /> </RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin> <AdminDashboard /> </RequireAdmin>} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 text-sm text-gray-600 dark:text-gray-400 text-center">
          © {new Date().getFullYear()} PickWise • Built with MERN
        </div>
      </footer>
    </div>

  );
}
