import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PostCreator } from "./PostCreator";
import { PostFeed } from "./PostFeed";
import { UserStats } from "./UserStats";
import { Leaderboard } from "./Leaderboard";
import { PeopleDirectory } from "./PeopleDirectory";
import { ProfileView } from "./ProfileView";
import { ProfileEdit } from "./ProfileEdit";
import { ProfilePhotoUpload } from "./ProfilePhotoUpload";
import { ClickableProfilePicture } from "./ClickableProfilePicture";
import { VoiceChatRoomPage } from "./VoiceChatRoomPage";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"feed" | "create" | "voice" | "stats" | "leaderboard" | "people">("feed");
  const [showProfileView, setShowProfileView] = useState<string | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const userProfile = useQuery(api.users.getUserProfile);

  const tabs = [
    { id: "feed" as const, label: "Feed", icon: "🏠" },
    { id: "create" as const, label: "Create", icon: "✍️" },
    { id: "voice" as const, label: "Voice", icon: "🎙️" },
    { id: "people" as const, label: "People", icon: "👥" },
    { id: "stats" as const, label: "Stats", icon: "📊" },
    { id: "leaderboard" as const, label: "Leaders", icon: "🏆" },
  ];

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ProfilePhotoUpload
              currentPhotoUrl={userProfile.profilePhotoUrl}
              displayName={userProfile.displayName}
              size="lg"
            />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome back, {userProfile.displayName}! 👋
              </h2>
              <p className="text-white/80">
                Role: <span className="capitalize font-medium">{userProfile.role.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowProfileEdit(true)}
                className="px-3 py-1 bg-white/20 text-white text-sm rounded hover:bg-white/30 transition-colors"
              >
                Edit Profile
              </button>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-bold">
                {userProfile.points} Points
              </div>
            </div>
            <div className="text-white/80 text-sm mt-1">
              Level {userProfile.level}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 mb-6 border border-white/20">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-slide-up">
        {activeTab === "feed" && <PostFeed onProfileClick={setShowProfileView} />}
        {activeTab === "create" && <PostCreator />}
        {activeTab === "people" && <PeopleDirectory onProfileClick={setShowProfileView} />}
        {activeTab === "stats" && <UserStats />}
        {activeTab === "leaderboard" && <Leaderboard onProfileClick={setShowProfileView} />}
      </div>

      {/* Profile Modals */}
      {showProfileView && (
        <ProfileView 
          userId={showProfileView} 
          onClose={() => setShowProfileView(null)} 
        />
      )}
      
      {showProfileEdit && (
        <ProfileEdit 
          onClose={() => setShowProfileEdit(false)} 
        />
      )}
    </div>
  );
}
