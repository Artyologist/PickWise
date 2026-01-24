import { Link } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';

export default function Header() {
  const token = localStorage.getItem('token');

  return (
    <header className="bg-white shadow sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold">
            PW
          </div>
          <div>
            <div className="font-semibold">PickWise</div>
            <div className="text-xs text-gray-500">
              Cross-platform entertainment discovery
            </div>
          </div>
        </Link>

        {/* GLOBAL SEARCH */}
        <div className="flex-1 max-w-xl">
          <GlobalSearch />
        </div>

        {/* Nav */}
        <nav className="flex items-center space-x-4">
          <Link to="/">Home</Link>
          <Link to="/upcoming">Upcoming</Link>

          {token ? (
            <>
              <Link to="/profile">Profile</Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="text-red-600 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-3 py-1 rounded"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
