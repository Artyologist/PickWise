import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';
import SearchResults from './pages/SearchResults';
import ContentDetail from './pages/ContentDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import RequireAuth from './components/RequireAuth'


export default function App(){
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />          
          <Route path="/search/:category" element={<SearchResults />} />
          <Route path="/:category" element={<SearchResults />} />
          <Route path="/content/:id" element={<ContentDetail />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/profile"element={<RequireAuth> <Profile/> </RequireAuth>}/>
          
        </Routes>
      </main>
      <footer className="bg-white border-t mt-6">
        <div className="container mx-auto px-4 py-4 text-sm text-gray-600">
          © {new Date().getFullYear()} PickWise • Built with MERN
        </div>
      </footer>
    </div>
  );
}
