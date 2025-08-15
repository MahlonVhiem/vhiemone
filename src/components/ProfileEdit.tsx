import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { ProfilePhotoUpload } from "./ProfilePhotoUpload";

interface ProfileEditProps {
  onClose: () => void;
}

export function ProfileEdit({ onClose }: ProfileEditProps) {
  const userProfile = useQuery(api.users.getUserProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);
  
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    businessName: "",
    businessCategory: "",
    businessHours: "",
    businessServices: [] as string[],
    vehicleType: "",
    deliveryRadius: 0,
    availability: "",
    interests: [] as string[],
    favoriteVerses: [] as string[],
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [businessServicesInput, setBusinessServicesInput] = useState("");
  const [interestsInput, setInterestsInput] = useState("");
  const [favoriteVersesInput, setFavoriteVersesInput] = useState("");
  const [photoUpdated, setPhotoUpdated] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        bio: userProfile.bio || "",
        location: userProfile.location || "",
        website: userProfile.website || "",
        phone: userProfile.phone || "",
        businessName: userProfile.businessName || "",
        businessCategory: userProfile.businessCategory || "",
        businessHours: userProfile.businessHours || "",
        businessServices: userProfile.businessServices || [],
        vehicleType: userProfile.vehicleType || "",
        deliveryRadius: userProfile.deliveryRadius || 0,
        availability: userProfile.availability || "",
        interests: userProfile.interests || [],
        favoriteVerses: userProfile.favoriteVerses || [],
      });
      setBusinessServicesInput((userProfile.businessServices || []).join(", "));
      setInterestsInput((userProfile.interests || []).join(", "));
      setFavoriteVersesInput((userProfile.favoriteVerses || []).join("\n"));
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsLoading(true);
    try {
      const updates = {
        ...formData,
        businessServices: businessServicesInput.split(",").map(s => s.trim()).filter(Boolean),
        interests: interestsInput.split(",").map(s => s.trim()).filter(Boolean),
        favoriteVerses: favoriteVersesInput.split("\n").map(s => s.trim()).filter(Boolean),
      };

      await updateProfile(updates);
      toast.success("Profile updated successfully! 🎉");
      onClose();
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userProfile) {
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

  const renderRoleSpecificFields = () => {
    switch (userProfile.role) {
      case "business":
        return (
          <>
            <div>
              <label htmlFor="businessName" className="block text-white font-medium mb-2">Business Name</label>
              <input
                id="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Your business name"
              />
            </div>
            <div>
              <label htmlFor="businessCategory" className="block text-white font-medium mb-2">Business Category</label>
              <input
                id="businessCategory"
                type="text"
                value={formData.businessCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, businessCategory: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="e.g., Restaurant, Retail, Services"
              />
            </div>
            <div>
              <label htmlFor="businessHours" className="block text-white font-medium mb-2">Business Hours</label>
              <input
                id="businessHours"
                type="text"
                value={formData.businessHours}
                onChange={(e) => setFormData(prev => ({ ...prev, businessHours: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="e.g., Mon-Fri 9AM-5PM"
              />
            </div>
            <div>
              <label htmlFor="businessServices" className="block text-white font-medium mb-2">Services (comma separated)</label>
              <input
                id="businessServices"
                type="text"
                value={businessServicesInput}
                onChange={(e) => setBusinessServicesInput(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="e.g., Consulting, Repair, Catering"
              />
            </div>
          </>
        );
      case "delivery_driver":
        return (
          <>
            <div>
              <label htmlFor="vehicleType" className="block text-white font-medium mb-2">Vehicle Type</label>
              <input
                id="vehicleType"
                type="text"
                value={formData.vehicleType}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="e.g., Car, Truck, Motorcycle"
              />
            </div>
            <div>
              <label htmlFor="deliveryRadius" className="block text-white font-medium mb-2">Delivery Radius (miles)</label>
              <input
                id="deliveryRadius"
                type="number"
                value={formData.deliveryRadius}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryRadius: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <label htmlFor="availability" className="block text-white font-medium mb-2">Availability</label>
              <input
                id="availability"
                type="text"
                value={formData.availability}
                onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="e.g., Weekdays 9AM-5PM"
              />
            </div>
          </>
        );
      case "shopper":
        return (
          <>
            <div>
              <label htmlFor="interests" className="block text-white font-medium mb-2">Interests (comma separated)</label>
              <input
                id="interests"
                type="text"
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="e.g., Reading, Music, Cooking"
              />
            </div>
            <div>
              <label htmlFor="favoriteVerses" className="block text-white font-medium mb-2">Favorite Bible Verses (one per line)</label>
              <textarea
                id="favoriteVerses"
                value={favoriteVersesInput}
                onChange={(e) => setFavoriteVersesInput(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                placeholder="e.g., John 3:16\nPhilippians 4:13"
                rows={4}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Photo */}
          <div className="text-center mb-6">
            <label className="block text-white font-medium mb-3">Profile Photo</label>
            <div className="flex justify-center">
              <ProfilePhotoUpload
                currentPhotoUrl={userProfile.profilePhotoUrl}
                displayName={userProfile.displayName}
                size="lg"
                onPhotoUpdated={() => setPhotoUpdated(!photoUpdated)}
              />
            </div>
            <p className="text-white/60 text-sm mt-2">Click to upload or change your profile photo</p>
          </div>

          {/* Basic Info */}
          <div>
            <label htmlFor="displayName" className="block text-white font-medium mb-2">Display Name *</label>
            <input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Your display name"
              required
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-white font-medium mb-2">Bio</label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-white font-medium mb-2">Location</label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Your city, state"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-white font-medium mb-2">Website</label>
            <input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-white font-medium mb-2">Phone</label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Your phone number"
            />
          </div>

          {/* Role-specific fields */}
          {renderRoleSpecificFields()}

          <button
            type="submit"
            disabled={!formData.displayName.trim() || isLoading}
            className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
