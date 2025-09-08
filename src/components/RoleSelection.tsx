import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface RoleSelectionProps {
  preSelectedRole?: "shopper" | "business" | "delivery_driver";
}

export function RoleSelection({ preSelectedRole }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<"shopper" | "business" | "delivery_driver" | null>(preSelectedRole || null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const createProfile = useMutation(api.users.createProfile);
  const navigate = useNavigate();

  // Set the pre-selected role when component mounts
  useEffect(() => {
    if (preSelectedRole) {
      setSelectedRole(preSelectedRole);
    }
  }, [preSelectedRole]);

  const roles = [
    {
      id: "shopper" as const,
      title: "Shopper",
      description: "Connect with Christian businesses and find faith-based products and services",
      icon: "🛍️",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      id: "business" as const,
      title: "Business",
      description: "Share your Christian business and connect with the community",
      icon: "🏪",
      gradient: "from-green-500 to-blue-500"
    },
    {
      id: "delivery_driver" as const,
      title: "Delivery Driver",
      description: "Serve the community by providing delivery services",
      icon: "🚗",
      gradient: "from-yellow-500 to-orange-500"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !displayName.trim()) return;

    setIsLoading(true);
    try {
      await createProfile({
        role: selectedRole,
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
      });
      toast.success("Welcome to Vhiem! You've earned 100 points! 🎉");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to create profile. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
          {preSelectedRole ? "Complete Your Profile" : "Choose Your Role"}
        </h2>
        <p className="text-white/80 text-lg">
          {preSelectedRole 
            ? `You're joining as a ${preSelectedRole.replace('_', ' ')}. Let's set up your profile!`
            : "How would you like to participate in the Vhiem community?"
          }
        </p>
      </div>

      {!preSelectedRole && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedRole === role.id
                  ? "ring-4 ring-yellow-400 scale-105"
                  : "hover:ring-2 hover:ring-white/30"
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <div className={`bg-gradient-to-br ${role.gradient} p-6 rounded-2xl text-white h-full`}>
                <div className="text-4xl mb-4">{role.icon}</div>
                <h3 className="text-xl font-bold mb-2">{role.title}</h3>
                <p className="text-white/90 text-sm">{role.description}</p>
              </div>
              {selectedRole === role.id && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-black text-sm">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {preSelectedRole && (
        <div className="mb-8">
          <div className="flex justify-center">
            {roles.filter(role => role.id === preSelectedRole).map((role) => (
              <div key={role.id} className={`bg-gradient-to-br ${role.gradient} p-6 rounded-2xl text-white max-w-sm`}>
                <div className="text-center">
                  <div className="text-4xl mb-4">{role.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{role.title}</h3>
                  <p className="text-white/90 text-sm">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRole && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Display Name *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter your display name"
                required
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">
                Bio (Optional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={!selectedRole || !displayName.trim() || isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading ? "Creating Profile..." : "Join Vhiem Community"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}