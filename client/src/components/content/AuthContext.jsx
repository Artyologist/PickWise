import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        try {
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });
    const [loading, setLoading] = useState(!!token);

    useEffect(() => {
        if (token) {
            // Safety timeout — never block render for more than 3 seconds
            const timeout = setTimeout(() => setLoading(false), 3000);
            fetchUser().finally(() => clearTimeout(timeout));
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.ok) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                logout();
            }
        } catch (e) {
            console.error('Auth refresh failed', e);
            // Don't logout on network errors — user may just be offline
        } finally {
            setLoading(false);
        }
    };

    const login = (newToken, newUser) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    // Show a minimal spinner only while auth is initialising
    // Never block the entire app — max wait 3 seconds
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold animate-pulse">
                        Loading PickWise...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout, loading, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
