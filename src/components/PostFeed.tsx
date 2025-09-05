import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { ClickableProfilePicture } from "./ClickableProfilePicture";
import { UserMentionInput } from "./UserMentionInput";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";


interface PostFeedProps {
  onProfileClick?: (userId: string) => void;
}

export function PostFeed({ onProfileClick }: PostFeedProps) {
  const posts = useQuery(api.posts.getPosts);
  const likePost = useMutation(api.posts.likePost);
  const likeComment = useMutation(api.posts.likeComment);
  const addComment = useMutation(api.posts.addComment);
  const addCommentReply = useMutation(api.posts.addCommentReply);
  const followUser = useMutation(api.users.followUser);
  const unfollowUser = useMutation(api.users.unfollowUser);
  
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  const [mentionedUsers, setMentionedUsers] = useState<Record<string, string[]>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const handleLike = async (postId: string) => {
    try {
      const liked = await likePost({ postId: postId as any });
      toast.success(liked ? "Post liked! ❤️" : "Like removed");
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const liked = await likeComment({ commentId: commentId as any });
      toast.success(liked ? "Comment liked! ❤️" : "Like removed");
    } catch (error) {
      toast.error("Failed to like comment");
    }
  };

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      await addComment({ 
        postId: postId as any, 
        content,
        mentionedUsers: mentionedUsers[`comment-${postId}`] as any
      });
      setCommentInputs((prev: Record<string, string>) => ({ ...prev, [postId]: "" }));
      setMentionedUsers((prev: Record<string, string[]>) => ({ ...prev, [`comment-${postId}`]: [] }));
      toast.success("Comment added! +5 points! 💬");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleReply = async (commentId: string) => {
    const content = replyInputs[commentId]?.trim();
    if (!content) return;

    try {
      await addCommentReply({ 
        commentId: commentId as any, 
        content,
        mentionedUsers: mentionedUsers[`reply-${commentId}`] as any
      });
      setReplyInputs((prev: Record<string, string>) => ({ ...prev, [commentId]: "" }));
      setMentionedUsers((prev: Record<string, string[]>) => ({ ...prev, [`reply-${commentId}`]: [] }));
      toast.success("Reply added! +5 points! 💬");
    } catch (error) {
      toast.error("Failed to add reply");
    }
  };

  const handleFollow = async (userId: string, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        const result = await unfollowUser({ userId: userId as any });
        if (result) {
          setFollowingStates((prev: Record<string, boolean>) => ({ ...prev, [userId]: false }));
          toast.success("Unfollowed user");
        }
      } else {
        const result = await followUser({ userId: userId as any });
        if (result) {
          setFollowingStates((prev: Record<string, boolean>) => ({ ...prev, [userId]: true }));
          toast.success("Following user! 🎉");
        }
      }
    } catch (error: any) {
      console.error("Follow error:", error);
      if (error.message?.includes("Cannot follow yourself")) {
        toast.error("You cannot follow yourself");
      } else {
        toast.error("Failed to update follow status");
      }
    }
  };

  const getPostTypeStyle = (type: string) => {
    switch (type) {
      case "verse": return "from-blue-500 to-purple-600";
      case "prayer": return "from-purple-500 to-pink-600";
      case "testimony": return "from-green-500 to-blue-500";
      default: return "from-yellow-500 to-orange-500";
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "verse": return "📖";
      case "prayer": return "🙏";
      case "testimony": return "✨";
      default: return "💬";
    }
  };

  const renderContentWithMentions = (content: string, postId: string) => {
    const isExpanded = expandedPosts[postId];
    const isLong = content.length > 250;

    const toggleExpanded = () => {
      setExpandedPosts((prev: Record<string, boolean>) => ({ ...prev, [postId]: !isExpanded }));
    };

    const renderText = () => {
      const textToShow = isExpanded ? content : `${content.substring(0, 250)}${isLong ? "..." : ""}`;
      const mentionRegex = /@(\w+)/g;
      const parts = textToShow.split(mentionRegex);
      
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          // This is a mention
          return (
            <span key={index} className="text-blue-400 font-medium">
              @{part}
            </span>
          );
        }
        return part;
      });
    };

    return (
      <div>
        {renderText()}
        {isLong && (
          <button onClick={toggleExpanded} className="text-blue-400 hover:underline ml-2">
            {isExpanded ? "See Less" : "See More"}
          </button>
        )}
      </div>
    );
  };

  if (!posts) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
          <p className="text-white/80">Be the first to share something with the community!</p>
        </div>
      ) : (
        posts.map((post, idx) => (
          <PostItem
            key={post._id}
            post={post}
            showComments={showComments[post._id] || false}
            commentInput={commentInputs[post._id] || ""}
            replyInputs={replyInputs}
            showReplies={showReplies}
            followingState={followingStates[post.authorProfile?.userId || ""] ?? false}
            onLike={() => handleLike(post._id)}
            onCommentLike={handleCommentLike}
            onComment={() => handleComment(post._id)}
            onReply={handleReply}
            onToggleComments={() => setShowComments((prev: Record<string, boolean>) => ({ ...prev, [post._id]: !prev[post._id] }))}
            onToggleReplies={(commentId: string) => setShowReplies((prev: Record<string, boolean>) => ({ ...prev, [commentId]: !prev[commentId] }))}
            onCommentInputChange={(value) => setCommentInputs((prev: Record<string, string>) => ({ ...prev, [post._id]: value }))}
            onReplyInputChange={(commentId: string, value: string) => setReplyInputs((prev: Record<string, string>) => ({ ...prev, [commentId]: value }))}
            onMentionedUsersChange={(key: string, users: string[]) => setMentionedUsers((prev: Record<string, string[]>) => ({ ...prev, [key]: users }))}
            onFollow={(userId, isFollowing) => handleFollow(userId, isFollowing)}
            onProfileClick={onProfileClick}
            getPostTypeStyle={getPostTypeStyle}
            getPostTypeIcon={getPostTypeIcon}
            renderContentWithMentions={(content) => renderContentWithMentions(content, post._id)}
            onImageClick={() => {
              setIndex(idx);
              setOpen(true);
            }}
          />
        ))
      )}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={posts.filter(p => p.postPhotoUrl).map(p => ({ src: p.postPhotoUrl! }))}
        index={index}
      />
    </div>
  );
}

interface PostItemProps {
  post: any;
  showComments: boolean;
  commentInput: string;
  replyInputs: Record<string, string>;
  showReplies: Record<string, boolean>;
  followingState: boolean;
  onLike: () => void;
  onCommentLike: (commentId: string) => void;
  onComment: () => void;
  onReply: (commentId: string) => void;
  onToggleComments: () => void;
  onToggleReplies: (commentId: string) => void;
  onCommentInputChange: (value: string) => void;
  onReplyInputChange: (commentId: string, value: string) => void;
  onMentionedUsersChange: (key: string, users: string[]) => void;
  onFollow: (userId: string, isFollowing: boolean) => void;
  onProfileClick?: (userId: string) => void;
  getPostTypeStyle: (type: string) => string;
  getPostTypeIcon: (type: string) => string;
  renderContentWithMentions: (content: string) => React.ReactNode;
  onImageClick: () => void;
}

function PostItem({
  post,
  showComments,
  commentInput,
  replyInputs,
  showReplies,
  followingState,
  onLike,
  onCommentLike,
  onComment,
  onReply,
  onToggleComments,
  onToggleReplies,
  onCommentInputChange,
  onReplyInputChange,
  onMentionedUsersChange,
  onFollow,
  onProfileClick,
  getPostTypeStyle,
  getPostTypeIcon,
  renderContentWithMentions,
  onImageClick,
}: PostItemProps) {
  const comments = useQuery(api.posts.getPostComments, { postId: post._id });

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-slide-up">
      {/* Post Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 text-center sm:text-left">
          <ClickableProfilePicture
            userId={post.authorProfile?.userId}
            profilePhotoUrl={post.authorProfile?.profilePhotoUrl}
            displayName={post.author}
            size="md"
            onClick={onProfileClick}
            onView={onImageClick}
          />
          <div>
            <button 
              onClick={() => post.authorProfile?.userId && onProfileClick?.(post.authorProfile.userId)}
              className="font-bold text-white hover:text-yellow-400 transition-colors text-left"
            >
              {post.author}
            </button>
            <div className="text-white/60 text-sm">
              Level {post.authorProfile?.level || 1} • {post.authorProfile?.points || 0} points • {post.authorFollowerCount || 0} followers
            </div>
          </div>
          {post.authorProfile && post.authorProfile.userId && !post.isOwnPost && (
            <button
              onClick={() => onFollow(post.authorProfile!.userId, followingState)}
              className="px-3 py-1 rounded bg-blue-600/20 text-blue-400 text-xs font-medium hover:bg-blue-600/30 transition-colors border border-blue-400/30"
            >
              {followingState ? "Following" : "Follow"}
            </button>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getPostTypeStyle(post.type)} text-white text-sm font-medium flex items-center space-x-1 mt-2 sm:mt-0 self-end sm:self-auto`}>
          <span>{getPostTypeIcon(post.type)}</span>
          <span className="capitalize">{post.type}</span>
        </div>
      </div>

      {/* Post Content */}
      <div className="text-white mb-4 leading-relaxed">
        {renderContentWithMentions(post.content)}
      </div>

      {/* Post Photo */}
      {post.postPhotoUrl && (
        <div className="mb-4 cursor-pointer" onClick={onImageClick}>
          <img
            src={post.postPhotoUrl}
            alt="Post image"
            className="w-full max-h-96 object-contain rounded-lg"
          />
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag: string, index: number) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/20 rounded-full text-white/80 text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 border-t border-white/20 pt-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onLike}
            className="flex items-center space-x-2 text-white/80 hover:text-red-400 transition-colors"
          >
            <span>❤️</span>
            <span>{post.likes}</span>
          </button>
          
          <button
            onClick={onToggleComments}
            className="flex items-center space-x-2 text-white/80 hover:text-blue-400 transition-colors"
          >
            <span>💬</span>
            <span>{post.comments}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-white/80 hover:text-green-400 transition-colors">
            <span>🔄</span>
            <span>{post.shares}</span>
          </button>
        </div>
        
        <div className="text-white/60 text-sm text-center sm:text-right">
          {new Date(post._creationTime).toLocaleDateString()}
        </div>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/20">
          {/* Existing Comments */}
          {comments && comments.length > 0 && (
            <div className="space-y-4 mb-4">
              {comments.map((comment) => (
                <div key={comment._id} className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:space-x-3">
                    <ClickableProfilePicture
                      userId={comment.authorProfile?.userId}
                      profilePhotoUrl={comment.authorProfile?.profilePhotoUrl}
                      displayName={comment.author}
                      size="sm"
                      onClick={onProfileClick}
                      onView={onImageClick}
                    />
                    <div className="flex-1 bg-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => comment.authorProfile?.userId && onProfileClick?.(comment.authorProfile.userId)}
                            className="font-medium text-white hover:text-yellow-400 transition-colors text-sm"
                          >
                            {comment.author}
                          </button>
                          <span className="text-white/60 text-xs">
                            {new Date(comment._creationTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onCommentLike(comment._id)}
                            className={`flex items-center space-x-1 text-xs transition-colors ${
                              comment.hasLiked ? "text-red-400" : "text-white/60 hover:text-red-400"
                            }`}
                          >
                            <span>❤️</span>
                            <span>{comment.likes}</span>
                          </button>
                          <button
                            onClick={() => onToggleReplies(comment._id)}
                            className="text-xs text-white/60 hover:text-blue-400 transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                      <p className="text-white/90 text-sm">
                        {renderContentWithMentions(comment.content)}
                      </p>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-4 sm:ml-8 space-y-2">
                      {comment.replies.map((reply: any) => (
                        <div key={reply._id} className="flex space-x-2">
                          <ClickableProfilePicture
                            userId={reply.authorProfile?.userId}
                            profilePhotoUrl={reply.authorProfile?.profilePhotoUrl}
                            displayName={reply.author}
                            size="sm"
                            onClick={onProfileClick}
                            onView={onImageClick}
                          />
                          <div className="flex-1 bg-white/5 rounded-lg p-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <button 
                                onClick={() => reply.authorProfile?.userId && onProfileClick?.(reply.authorProfile.userId)}
                                className="font-medium text-white hover:text-yellow-400 transition-colors text-xs"
                              >
                                {reply.author}
                              </button>
                              <span className="text-white/60 text-xs">
                                {new Date(reply._creationTime).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-white/90 text-xs">
                              {renderContentWithMentions(reply.content)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  {showReplies[comment._id] && (
                    <div className="ml-4 sm:ml-8 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <UserMentionInput
                        value={replyInputs[comment._id] || ""}
                        onChange={(value) => onReplyInputChange(comment._id, value)}
                        onMentionedUsersChange={(users) => onMentionedUsersChange(`reply-${comment._id}`, users)}
                        className="w-full sm:w-auto px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        placeholder="Reply with @username to mention..."
                        onKeyPress={(e) => e.key === "Enter" && onReply(comment._id)}
                      />
                      <button
                        onClick={() => onReply(comment._id)}
                        className="w-full sm:w-auto px-3 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-300 text-sm"
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <UserMentionInput
              value={commentInput}
              onChange={onCommentInputChange}
              onMentionedUsersChange={(users) => onMentionedUsersChange(`comment-${post._id}`, users)}
              className="w-full sm:w-auto px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Add a comment... Use @username to mention someone"
              onKeyPress={(e) => e.key === "Enter" && onComment()}
            />
            <button
              onClick={onComment}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}