import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ProfileViewProps {
  userId: string;
  onClose: () => void;
}

export function ProfileView({ userId, onClose }: ProfileViewProps) {
  const profile = useQuery(api.profiles.getProfileById, { userId: userId as any });
  const followUser = useMutation(api.users.followUser);
  const unfollowUser = useMutation(api.users.unfollowUser);
  
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = async () => {
    try {
      if (isFollowing || profile?.isFollowing) {
        const result = await unfollowUser({ userId: userId as any });
        if (result) {
          setIsFollowing(false);
          toast.success("Unfollowed user");
        }
      } else {
        const result = await followUser({ userId: userId as any });
        if (result) {
          setIsFollowing(true);
          toast.success("Following user! 🎉");
        }
      }
    } catch (error: any) {
      console.error("Follow error:", error);
      toast.error("Failed to update follow status");
    }
  };

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl w-full">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  const getRoleSpecificFields = () => {
    switch (profile.role) {
      case "business":
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">Business Information</h4>
            {profile.businessName && (
              <div>
                <span className="text-white/60">Business Name: </span>
                <span className="text-white">{profile.businessName}</span>
              </div>
            )}
            {profile.businessCategory && (
              <div>
                <span className="text-white/60">Category: </span>
                <span className="text-white">{profile.businessCategory}</span>
              </div>
            )}
            {profile.businessHours && (
              <div>
                <span className="text-white/60">Hours: </span>
                <span className="text-white">{profile.businessHours}</span>
              </div>
            )}
            {profile.businessServices && profile.businessServices.length > 0 && (
              <div>
                <span className="text-white/60">Services: </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.businessServices.map((service, index) => (
                    <span key={index} className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case "delivery_driver":
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">Delivery Information</h4>
            {profile.vehicleType && (
              <div>
                <span className="text-white/60">Vehicle: </span>
                <span className="text-white">{profile.vehicleType}</span>
              </div>
            )}
            {profile.deliveryRadius && (
              <div>
                <span className="text-white/60">Delivery Radius: </span>
                <span className="text-white">{profile.deliveryRadius} miles</span>
              </div>
            )}
            {profile.availability && (
              <div>
                <span className="text-white/60">Availability: </span>
                <span className="text-white">{profile.availability}</span>
              </div>
            )}
          </div>
        );
      case "shopper":
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">Interests</h4>
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <span className="text-white/60">Interests: </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.interests.map((interest, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.favoriteVerses && profile.favoriteVerses.length > 0 && (
              <div>
                <span className="text-white/60">Favorite Verses: </span>
                <div className="space-y-2 mt-1">
                  {profile.favoriteVerses.map((verse, index) => (
                    <div key={index} className="text-white/80 italic text-sm bg-white/10 p-2 rounded">
                      "{verse}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-center sm:text-left">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
              {profile.profilePhotoUrl ? (
                <img 
                  src={profile.profilePhotoUrl} 
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-black font-bold text-xl">
                  {profile.displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profile.displayName}</h2>
              <p className="text-white/80 capitalize">{profile.role.replace('_', ' ')}</p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-white/60 mt-2 sm:mt-1">
                <span>{profile.followerCount} followers</span>
                <span>{profile.followingCount} following</span>
                <span>Level {profile.level}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Follow Button */}
        {profile.canFollow && (
          <div className="mb-6">
            <button
              onClick={handleFollow}
              className={`px-6 py-2 rounded font-medium transition-all duration-300 border ${
                isFollowing || profile.isFollowing
                  ? "bg-gray-600/20 text-gray-400 border-gray-400/30 hover:bg-gray-600/30"
                  : "bg-blue-600/20 text-blue-400 border-blue-400/30 hover:bg-blue-600/30"
              }`}
            >
              {isFollowing || profile.isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl text-white text-center">
            <div className="text-xl font-bold">{profile.points}</div>
            <div className="text-xs text-white/80">Points</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-blue-500 p-4 rounded-xl text-white text-center">
            <div className="text-xl font-bold">{profile.level}</div>
            <div className="text-xs text-white/80">Level</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-xl text-white text-center">
            <div className="text-xl font-bold">{profile.badges.length}</div>
            <div className="text-xs text-white/80">Badges</div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-white mb-2">About</h4>
            <p className="text-white/80">{profile.bio}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="mb-6 space-y-2">
          {profile.location && (
            <div className="flex items-center space-x-2 text-white/80">
              <span>📍</span>
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center space-x-2 text-white/80">
              <span>🌐</span>
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                {profile.website}
              </a>
            </div>
          )}
          {profile.phone && (
            <div className="flex items-center space-x-2 text-white/80">
              <span>📞</span>
              <span>{profile.phone}</span>
            </div>
          )}
        </div>

        {/* Role-specific fields */}
        {getRoleSpecificFields()}

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-bold text-white mb-3">Badges</h4>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full font-medium text-sm capitalize"
                >
                  🏆 {badge.replace('_', ' ')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
