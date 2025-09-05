import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface ClickableProfilePictureProps {
  userId?: string;
  profilePhotoUrl?: string | null;
  displayName: string;
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: (userId: string) => void;
  onView?: (url: string) => void;
  className?: string;
}

export function ClickableProfilePicture({ 
  userId, 
  profilePhotoUrl, 
  displayName, 
  size = "md", 
  onClick,
  onView,
  className = ""
}: ClickableProfilePictureProps) {
  const [open, setOpen] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg", 
    xl: "w-16 h-16 text-xl"
  };

  const baseClasses = `bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden ${sizeClasses[size]} ${className}`;
  
  const handleView = () => {
    if (profilePhotoUrl) {
      setOpen(true);
    }
  };

  if (userId && onClick) {
    return (
      <button 
        onClick={() => onClick(userId)}
        className={`${baseClasses} hover:scale-110 transition-transform cursor-pointer`}
        title={`View ${displayName}'s profile`}
      >
        {profilePhotoUrl ? (
          <div onClick={(e) => { e.stopPropagation(); handleView(); }}>
              <img 
                src={profilePhotoUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
          </div>
        ) : (
          <span className="text-black font-bold">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {profilePhotoUrl ? (
        <div onClick={handleView}>
          <img 
            src={profilePhotoUrl} 
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <span className="text-black font-bold">
          {displayName.charAt(0).toUpperCase()}
        </span>
      )}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={profilePhotoUrl ? [{ src: profilePhotoUrl }] : []}
      />
    </div>
  );
}