import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import GlobalSearch from './GlobalSearch';
import logo from '../assets/ratings/PickWise.png';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from './content/AuthContext';

export default function Header() {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  // Pages with hardcoded dark backgrounds — nav must always look dark here
  const isDarkPage =
    location.pathname === '/' ||
    location.pathname.startsWith('/content/');

  // Dynamic class helpers
  const navBg = isDarkPage
    ? 'bg-slate-950/70 border-white/10'
    : 'bg-white/80 dark:bg-slate-950/80 border-gray-200/60 dark:border-white/10';

  const logoText = isDarkPage
    ? 'text-white'
    : 'text-gray-900 dark:text-white';

  const logoSub = isDarkPage
    ? 'text-gray-400'
    : 'text-gray-500 dark:text-gray-400';

  const iconBtn = isDarkPage
    ? 'text-gray-400 hover:bg-white/10 hover:text-white'
    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800';

  const navLink = (path) => {
    const active = location.pathname === path;
    if (isDarkPage) {
      return active
        ? 'text-indigo-400 font-bold'
        : 'text-gray-300 hover:text-indigo-400';
    }
    return active
      ? 'text-indigo-500 dark:text-indigo-400 font-bold'
      : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400';
  };

  const hamburgerBtn = isDarkPage
    ? 'text-gray-300 hover:bg-white/10'
    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800';

  const mobileMenuBg = isDarkPage
    ? 'bg-slate-950/95 border-white/10'
    : 'bg-white/90 dark:bg-slate-950/95 border-gray-100 dark:border-white/10';

  const mobileLinkBase = isDarkPage
    ? 'text-gray-300 hover:text-indigo-400'
    : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400';

  return (
    <header className={`sticky top-0 z-[100] w-full backdrop-blur-2xl border-b transition-all duration-300 ${navBg}`}>

      {/* ── DESKTOP / TABLET ROW ──────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 md:gap-6">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 group"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-indigo-600 shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0">
            <img
              src={logo}
              alt="PickWise"
              className="w-full h-full object-contain transform scale-150"
            />
          </div>
          <div className="hidden sm:block">
            <div className={`font-bold text-base tracking-tight leading-none ${logoText}`}>PickWise</div>
            <div className={`text-[9px] uppercase tracking-wider font-medium ${logoSub}`}>
              Discover More
            </div>
          </div>
        </Link>

        {/* Search — takes remaining space, shrinks on mobile */}
        <div className="flex-1 min-w-0">
          <GlobalSearch />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-5 text-sm mr-2">
            <Link to="/" className={navLink('/')}>Home</Link>
            <Link to="/upcoming" className={navLink('/upcoming')}>Upcoming</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className={navLink('/admin')}>Admin</Link>
            )}
          </nav>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors outline-none focus:outline-none border-0 ${iconBtn}`}
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <SunIcon className="w-5 h-5" />
              : <MoonIcon className="w-5 h-5" />
            }
          </button>

          {/* Auth — desktop */}
          {token ? (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/profile"
                className={`p-2 rounded-full transition-colors ${iconBtn}`}
                title="My Profile"
              >
                <UserCircleIcon className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className={`p-2 rounded-full transition-colors outline-none focus:outline-none border-0 bg-transparent hover:text-red-400 hover:bg-red-500/10 ${iconBtn}`}
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm ml-1"
            >
              Sign In
            </Link>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className={`md:hidden p-2 rounded-xl transition-colors ${hamburgerBtn}`}
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <XMarkIcon className="w-6 h-6" />
              : <Bars3Icon className="w-6 h-6" />
            }
          </button>
        </div>
      </div>

      {/* ── MOBILE DROPDOWN MENU ──────────────────────────────────────── */}
      <Transition
        show={mobileOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-2"
      >
        <div className={`md:hidden border-t backdrop-blur-xl px-4 py-4 space-y-1 ${mobileMenuBg}`}>
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${navLink('/')}`}
          >
            Home
          </Link>
          <Link
            to="/upcoming"
            onClick={() => setMobileOpen(false)}
            className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${navLink('/upcoming')}`}
          >
            Upcoming
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${navLink('/admin')}`}
            >
              Admin
            </Link>
          )}

          <div className={`pt-2 border-t mt-2 ${isDarkPage ? 'border-white/10' : 'border-gray-100 dark:border-slate-800'}`}>
            {token ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 text-sm font-semibold hover:text-indigo-400 transition-colors ${isDarkPage ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <UserCircleIcon className="w-5 h-5" />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-auto flex items-center gap-1.5 text-sm text-red-400 hover:text-red-500 font-semibold transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </Transition>
    </header>
  );
}
