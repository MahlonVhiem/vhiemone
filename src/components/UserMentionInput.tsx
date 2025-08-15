import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ClickableProfilePicture } from "./ClickableProfilePicture";

interface UserMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionedUsersChange: (users: string[]) => void;
  placeholder?: string;
  className?: string;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

export function UserMentionInput({
  value,
  onChange,
  onMentionedUsersChange,
  placeholder,
  className,
  onKeyPress,
}: UserMentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const users = useQuery(
    api.posts.searchUsers,
    mentionQuery.length >= 2 ? { query: mentionQuery } : "skip"
  );

  useEffect(() => {
    onMentionedUsersChange(mentionedUsers);
  }, [mentionedUsers, onMentionedUsersChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    // Check for @ mentions
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setMentionQuery("");
    }
  };

  const handleUserSelect = (user: any) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const beforeMention = textBeforeCursor.slice(0, mentionMatch.index);
      const newValue = `${beforeMention}@${user.displayName} ${textAfterCursor}`;
      onChange(newValue);
      
      // Add user to mentioned users if not already included
      if (!mentionedUsers.includes(user.userId)) {
        setMentionedUsers(prev => [...prev, user.userId]);
      }
    }
    
    setShowSuggestions(false);
    setMentionQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
    onKeyPress?.(e);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={className}
        placeholder={placeholder}
      />
      
      {showSuggestions && users && users.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 py-2 z-50 max-h-48 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className="w-full px-3 py-2 text-left hover:bg-white/10 transition-colors flex items-center space-x-2"
            >
              <ClickableProfilePicture
                profilePhotoUrl={user.profilePhotoUrl}
                displayName={user.displayName}
                size="sm"
              />
              <div>
                <div className="text-white font-medium">{user.displayName}</div>
                <div className="text-white/60 text-xs capitalize">
                  {user.role.replace('_', ' ')} • Level {user.level}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
