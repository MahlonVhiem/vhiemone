import { Link } from "react-router-dom";

export function VoiceChatRoomPage() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-teal-400 to-yellow-300 bg-clip-text text-transparent mb-4">
          Voice Chat Room
        </h2>
        <p className="text-white/80 text-lg">
          This feature is coming soon. Stay tuned!
        </p>
      </div>
      <div className="text-center">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-3 py-3 px-6 bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
