import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ClickableProfilePicture } from "./ClickableProfilePicture";

interface LeaderboardProps {
  onProfileClick?: (userId: string) => void;
}

export function Leaderboard({ onProfileClick }: LeaderboardProps) {
  const leaderboard = useQuery(api.users.getLeaderboard);

  if (!leaderboard) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return `#${index + 1}`;
    }
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return "from-yellow-400 to-orange-500";
      case 1: return "from-gray-300 to-gray-500";
      case 2: return "from-orange-400 to-yellow-600";
      default: return "from-blue-500 to-purple-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          🏆 Community Leaders
        </h3>
        
        <div className="space-y-4">
          {leaderboard.map((user, index) => (
            <div
              key={user._id}
              className={`bg-gradient-to-r ${getRankStyle(index)} p-4 rounded-xl text-white flex items-center space-x-4 transform hover:scale-105 transition-all duration-300`}
            >
              <div className="text-2xl font-bold min-w-[3rem] text-center">
                {getRankIcon(index)}
              </div>
              
              <ClickableProfilePicture
                userId={user.userId}
                profilePhotoUrl={user.profilePhotoUrl}
                displayName={user.displayName}
                size="lg"
                onClick={onProfileClick}
                className="bg-white/20"
              />
              
              <div className="flex-1">
                <div className="font-bold text-lg">{user.displayName}</div>
                <div className="text-white/80 text-sm capitalize">
                  {user.role.replace('_', ' ')} • Level {user.level}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold">{user.points}</div>
                <div className="text-white/80 text-sm">points</div>
              </div>
            </div>
          ))}
        </div>
        
        {leaderboard.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏆</div>
            <h4 className="text-xl font-bold text-white mb-2">No leaders yet</h4>
            <p className="text-white/80">Start earning points to appear on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
}
