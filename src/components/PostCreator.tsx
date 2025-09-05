import { useState, useCallback } from "react";
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getCroppedImg } from './cropImage';

export function PostCreator() {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"verse" | "prayer" | "testimony" | "general">("general");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(4 / 3);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const createPost = useMutation(api.posts.createPost);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        toast.error("Image must be smaller than 25MB");
        return;
      }

      // For cropping
      const reader = new FileReader();
      reader.onload = () => setOriginalImage(reader.result as string);
      reader.readAsDataURL(file);

      // For immediate use (if not cropped)
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        setSelectedImage(compressedFile);
        setImagePreview(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error(error);
        toast.error("Failed to process image.");
      }
      
      setIsCropping(false);
    }
  };

  const handleCrop = async () => {
    if (originalImage && croppedAreaPixels) {
      const croppedImageFile = await getCroppedImg(originalImage, croppedAreaPixels);
      if (croppedImageFile) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        try {
          const compressedFile = await imageCompression(croppedImageFile, options);
          setSelectedImage(compressedFile);
          const newPreviewUrl = URL.createObjectURL(compressedFile);
          setImagePreview(newPreviewUrl);
          
          // Update originalImage to the new cropped image for re-cropping
          const reader = new FileReader();
          reader.onload = () => setOriginalImage(reader.result as string);
          reader.readAsDataURL(compressedFile);

        } catch (error) {
          console.error(error);
        }
      }
      setIsCropping(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setOriginalImage(null);
    setIsCropping(false);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAspectRatio(4 / 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      let photoId = undefined;
      
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

      setContent("");
      setTags("");
      removeImage();
      
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
            {[{"value": "general", "label": "General", "icon": "💬"},
              {"value": "verse", "label": "Bible Verse", "icon": "📖"},
              {"value": "prayer", "label": "Prayer", "icon": "🙏"},
              {"value": "testimony", "label": "Testimony", "icon": "✨"},
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
              type === "verse" ? `For God so loved the world... - John 3:16

This verse reminds me that...` :
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
                {!isCropping && <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-lg"
                />}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={removeImage}
                    className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Remove Image"
                  >
                    ×
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="bg-gray-700 bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600 transition-colors"
                      title="Image Options"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                        <button
                          onClick={() => {
                            setIsCropping(true);
                            setIsMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                        >
                          Crop Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {isCropping && (
                  <div className="fixed inset-0 bg-black bg-opacity-75 z-20 flex items-center justify-center">
                    <div className="relative w-full max-w-2xl h-3/4 bg-gray-900 rounded-lg overflow-hidden p-4">
                      <div className="relative w-full h-full">
                        <Cropper
                          image={originalImage!}
                          crop={crop}
                          zoom={zoom}
                          aspect={aspectRatio}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                        />
                      </div>
                      <div className="absolute bottom-4 right-4 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsCropping(false)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCrop}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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