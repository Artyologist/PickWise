import { useState } from 'react';

export default function Settings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handlePasswordChange = (e) => {
        e.preventDefault();
        alert("Password change functionality to be implemented in Phase 4");
    };

    const clearData = () => {
        if (confirm("Are you sure you want to clear local cookies and session data?")) {
            localStorage.clear();
            sessionStorage.clear();
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            window.location.href = '/login';
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-12">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white">Settings</h1>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-8">
                <h2 className="text-2xl font-bold">Security</h2>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl" />
                    </div>
                    <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">Update Password</button>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-8">
                <h2 className="text-2xl font-bold text-red-500">Danger Zone</h2>
                <p className="text-gray-500">Clear all local session data and cookies.</p>
                <button onClick={clearData} className="px-8 py-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl font-bold">Clear All Data</button>
            </div>
        </div>
    );
}
