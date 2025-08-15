import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function PostCreator() {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"verse" | "prayer" | "testimony" | "general">("general");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const createPost = useMutation(api.posts.createPost);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        toast.error("Image must be smaller than 25MB");
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      let photoId = undefined;
      
      // Upload image if selected
      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        
        if (!result.ok) {
          throw new Error("Failed to upload image");
        }
        
        const json = await result.json();
        photoId = json.storageId;
      }

      const tagArray = tags.split(",").map(tag => tag.trim()).filter(Boolean);
      
      await createPost({
        content,
        type,
        tags: tagArray,
        photoId,
      });

      // Reset form
      setContent("");
      setTags("");
      setSelectedImage(null);
      setImagePreview(null);
      
      const pointsEarned = type === "verse" ? 20 : type === "prayer" ? 15 : 10;
      toast.success(`Post created! +${pointsEarned} points! 🎉`);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeStyle = (postType: string) => {
    switch (postType) {
      case "verse": return "from-blue-500 to-purple-600";
      case "prayer": return "from-purple-500 to-pink-600";
      case "testimony": return "from-green-500 to-blue-500";
      default: return "from-yellow-500 to-orange-500";
    }
  };

  const getTypeIcon = (postType: string) => {
    switch (postType) {
      case "verse": return "📖";
      case "prayer": return "🙏";
      case "testimony": return "✨";
      default: return "💬";
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-slide-up">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">
        ✍️ Share Your Heart
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Post Type Selection */}
        <div>
          <label className="block text-white font-medium mb-3">Post Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "general", label: "General", icon: "💬" },
              { value: "verse", label: "Bible Verse", icon: "📖" },
              { value: "prayer", label: "Prayer", icon: "🙏" },
              { value: "testimony", label: "Testimony", icon: "✨" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value as any)}
                className={`p-3 rounded-xl border-2 transition-all duration-300 ${ 
                  type === option.value
                    ? `bg-gradient-to-r ${getTypeStyle(option.value)} text-white border-transparent`
                    : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                }`}
              >
                <div className="text-xl mb-1">{option.icon}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-white font-medium mb-2">
            {type === "verse" ? "Share a Bible verse and your thoughts" :
             type === "prayer" ? "Share your prayer request or praise" :
             type === "testimony" ? "Share your testimony" :
             "What's on your heart?"}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            placeholder={
              type === "verse" ? "\"For God so loved the world...\" - John 3:16\n\nThis verse reminds me that..." :
              type === "prayer" ? "Please pray for..." :
              type === "testimony" ? "God has been working in my life by..." :
              "Share what's on your heart..."
            }
            rows={6}
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-white font-medium mb-2">Add Photo (Optional)</label>
          <div className="space-y-3">
            {!imagePreview ? (
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-white/80">Click to add a photo</div>
                  <div className="text-white/60 text-sm mt-1">Max 25MB</div>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-white font-medium mb-2">Tags (Optional)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="faith, hope, love (comma separated)"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!content.trim() || isLoading}
          className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r ${getTypeStyle(type)} text-white`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Creating Post...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>{getTypeIcon(type)}</span>
              <span>Share Post</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
}
