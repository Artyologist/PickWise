export default function ProfileHeader({ user }) {
  return (
    <div className="flex items-center gap-6 bg-white p-6 rounded shadow">
      <img
        src={user.profileImage || '/avatar.png'}
        alt="profile"
        className="w-20 h-20 rounded-full object-cover"
      />
      <div>
        <h1 className="text-2xl font-bold">{user.username}</h1>
        <p className="text-gray-600">{user.reviewCount} reviews</p>
      </div>
    </div>
  );
}
