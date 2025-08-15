import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function UserStats() {
  const userProfile = useQuery(api.users.getUserProfile);
  const followCounts = useQuery(
    api.users.getFollowCounts,
    userProfile ? { userId: userProfile.userId } : "skip"
  );

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  const progressToNextLevel = ((userProfile.points % 1000) / 1000) * 100;

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
            {userProfile.profilePhotoUrl ? (
              <img 
                src={userProfile.profilePhotoUrl} 
                alt={userProfile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-black font-bold text-2xl">
                {userProfile.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{userProfile.displayName}</h2>
          <p className="text-white/80 capitalize">{userProfile.role.replace('_', ' ')}</p>
          {userProfile.bio && (
            <p className="text-white/60 mt-2">{userProfile.bio}</p>
          )}
        </div>

        {/* Level Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Level {userProfile.level}</span>
            <span className="text-white/80">
              {userProfile.points % 1000}/1000 XP
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressToNextLevel}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl text-white text-center">
            <div className="text-2xl font-bold">{userProfile.points}</div>
            <div className="text-sm text-white/80">Total Points</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-blue-500 p-4 rounded-xl text-white text-center">
            <div className="text-2xl font-bold">{userProfile.level}</div>
            <div className="text-sm text-white/80">Level</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-xl text-white text-center">
            <div className="text-2xl font-bold">{userProfile.badges.length}</div>
            <div className="text-sm text-white/80">Badges</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl text-white text-center">
            <div className="text-2xl font-bold">
              {Math.floor((Date.now() - userProfile.joinedAt) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-white/80">Days Active</div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl text-white text-center">
            <div className="text-2xl font-bold">{followCounts?.followers || 0}</div>
            <div className="text-sm text-white/80">Followers</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Your Badges</h3>
        <div className="flex flex-wrap gap-3">
          {userProfile.badges.map((badge, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-medium capitalize"
            >
              🏆 {badge.replace('_', ' ')}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Point Earning Tips</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-white/80">
            <span className="text-xl">📖</span>
            <span>Share Bible verses: +20 points</span>
          </div>
          <div className="flex items-center space-x-3 text-white/80">
            <span className="text-xl">🙏</span>
            <span>Post prayer requests: +15 points</span>
          </div>
          <div className="flex items-center space-x-3 text-white/80">
            <span className="text-xl">✨</span>
            <span>Share testimonies: +15 points</span>
          </div>
          <div className="flex items-center space-x-3 text-white/80">
            <span className="text-xl">💬</span>
            <span>Comment on posts: +5 points</span>
          </div>
          <div className="flex items-center space-x-3 text-white/80">
            <span className="text-xl">❤️</span>
            <span>Receive likes: +5 points</span>
          </div>
        </div>
      </div>
    </div>
  );
}
