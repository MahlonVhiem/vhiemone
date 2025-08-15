import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoUpdated?: () => void;
  size?: "sm" | "md" | "lg";
  displayName: string;
}

export function ProfilePhotoUpload({ 
  currentPhotoUrl, 
  onPhotoUpdated, 
  size = "md",
  displayName 
}: ProfilePhotoUploadProps) {
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);
  const updateProfilePhoto = useMutation(api.profiles.updateProfilePhoto);
  const removeProfilePhoto = useMutation(api.profiles.removeProfilePhoto);
  
  const [isUploading, setIsUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-16 h-16 text-xl",
    lg: "w-20 h-20 text-2xl"
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Image must be smaller than 25MB");
      return;
    }

    setIsUploading(true);
    setShowMenu(false);

    try {
      // Step 1: Get upload URL
      const postUrl = await generateUploadUrl();

      // Step 2: Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const json = await result.json();
      if (!result.ok) {
        throw new Error(`Upload failed: ${JSON.stringify(json)}`);
      }

      const { storageId } = json;

      // Step 3: Update profile with new photo
      await updateProfilePhoto({ storageId });
      
      toast.success("Profile photo updated! 📸");
      onPhotoUpdated?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await removeProfilePhoto();
      toast.success("Profile photo removed");
      onPhotoUpdated?.();
      setShowMenu(false);
    } catch (error) {
      console.error("Remove photo error:", error);
      toast.error("Failed to remove photo");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <div 
        className={`${sizeClasses[size]} bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden group`}
        onClick={() => setShowMenu(!showMenu)}
      >
        {currentPhotoUrl ? (
          <img 
            src={currentPhotoUrl} 
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-black font-bold">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            <span className="text-white text-xs">📸</span>
          )}
        </div>
      </div>

      {/* Menu */}
      {showMenu && (
        <div className="absolute top-full left-0 mt-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 py-2 min-w-[150px] z-50">
          <button
            onClick={handleUploadClick}
            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
          >
            📸 Upload Photo
          </button>
          {currentPhotoUrl && (
            <button
              onClick={handleRemovePhoto}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
            >
              🗑️ Remove Photo
            </button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
