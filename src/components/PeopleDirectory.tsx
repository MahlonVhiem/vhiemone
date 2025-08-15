import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { ClickableProfilePicture } from "./ClickableProfilePicture";

interface PeopleDirectoryProps {
  onProfileClick?: (userId: string) => void;
}

export function PeopleDirectory({ onProfileClick }: PeopleDirectoryProps) {
  const users = useQuery(api.users.getAllUsers);
  const followUser = useMutation(api.users.followUser);
  const unfollowUser = useMutation(api.users.unfollowUser);
  
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  const handleFollow = async (userId: string, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        const result = await unfollowUser({ userId: userId as any });
        if (result) {
          setFollowingStates(prev => ({ ...prev, [userId]: false }));
          toast.success("Unfollowed user");
        }
      } else {
        const result = await followUser({ userId: userId as any });
        if (result) {
          setFollowingStates(prev => ({ ...prev, [userId]: true }));
          toast.success("Following user! 🎉");
        }
      }
    } catch (error: any) {
      console.error("Follow error:", error);
      if (error.message?.includes("Cannot follow yourself")) {
        toast.error("You cannot follow yourself");
      } else {
        toast.error("Failed to update follow status");
      }
    }
  };

  if (!users) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          👥 Discover People
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-3">
                <ClickableProfilePicture
                  userId={user.userId}
                  profilePhotoUrl={user.profilePhotoUrl}
                  displayName={user.displayName}
                  size="lg"
                  onClick={onProfileClick}
                />
                <div className="flex-1">
                  <div className="font-bold text-white">{user.displayName}</div>
                  <div className="text-white/60 text-sm capitalize">
                    {user.role.replace('_', ' ')} • Level {user.level}
                  </div>
                </div>
              </div>
              
              {user.bio && (
                <p className="text-white/80 text-sm mb-3 line-clamp-2">{user.bio}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-white/60 text-sm">
                  {user.points} points
                </div>
                
                {user.canFollow && (
                  <button
                    onClick={() => handleFollow(user.userId, followingStates[user.userId] ?? user.isFollowing)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all duration-300 border ${
                      followingStates[user.userId] ?? user.isFollowing
                        ? "bg-gray-600/20 text-gray-400 border-gray-400/30 hover:bg-gray-600/30"
                        : "bg-blue-600/20 text-blue-400 border-blue-400/30 hover:bg-blue-600/30"
                    }`}
                  >
                    {followingStates[user.userId] ?? user.isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👥</div>
            <h4 className="text-xl font-bold text-white mb-2">No users yet</h4>
            <p className="text-white/80">Be the first to join the community!</p>
          </div>
        )}
      </div>
    </div>
  );
}
