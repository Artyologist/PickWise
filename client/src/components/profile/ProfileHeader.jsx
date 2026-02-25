import { useState } from 'react';
import axios from 'axios';

export default function ProfileHeader({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || ''
  });

  if (!user) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/users/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.ok) {
        onUpdate(data.user);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const joinYear = user.createdAt ? new Date(user.createdAt).getFullYear() : '2026';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden relative border border-gray-100 dark:border-slate-800 transition-all duration-300">
      {/* Cover Gradient */}
      <div className="h-40 bg-slate-900 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>

      <div className="px-5 sm:px-10 pb-6 sm:pb-10">
        <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 sm:-mt-16 gap-4 sm:gap-8">
          {/* Avatar Section */}
          <div className="p-2 bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl relative z-10">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
              {formData.profileImage || user.profileImage ? (
                <img
                  src={isEditing ? formData.profileImage : user.profileImage}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl">👤</span>
              )}
            </div>
          </div>

          {/* User Info / Edit Form */}
          <div className="flex-1 mb-2 sm:mb-4 space-y-2 text-center md:text-left pt-2 sm:pt-4">
            {isEditing ? (
              <div className="space-y-4 w-full max-w-md">
                <input
                  className="w-full bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username"
                />
                <textarea
                  className="w-full bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
                <input
                  className="w-full bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  value={formData.profileImage}
                  onChange={e => setFormData({ ...formData, profileImage: e.target.value })}
                  placeholder="Profile Image URL"
                />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                  <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{user.username}</h1>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase rounded-full">Explorer</span>
                </div>
                <p className="text-gray-500 dark:text-slate-400 font-medium italic">Member since {joinYear}</p>
                {user.bio && <p className="mt-4 text-gray-600 dark:text-slate-300 max-w-xl leading-relaxed">{user.bio}</p>}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-4 sm:mb-6 justify-center md:justify-start">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-500/20"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                Edit Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
