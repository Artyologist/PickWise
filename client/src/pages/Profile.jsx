import { useEffect, useState } from 'react';
import { getMyProfile, getMyReviews, getMyStats } from '../api/users';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import UserReviewsGrid from '../components/profile/UserReviewsGrid';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyProfile(),
      getMyReviews(),
      getMyStats()
    ]).then(([p, r, s]) => {
      setProfile(p.data.user);
      setReviews(r.data.results);
      setStats(s.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="space-y-8">
      <ProfileHeader user={profile} />
      <ProfileStats stats={stats} />
      <UserReviewsGrid reviews={reviews} />
    </div>
  );
}
