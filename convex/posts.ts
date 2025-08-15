import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createPost = mutation({
  args: {
    content: v.string(),
    type: v.union(v.literal("verse"), v.literal("prayer"), v.literal("testimony"), v.literal("general")),
    tags: v.array(v.string()),
    photoId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const postId = await ctx.db.insert("posts", {
      authorId: userId,
      content: args.content,
      type: args.type,
      tags: args.tags,
      photoId: args.photoId,
      likes: 0,
      comments: 0,
      shares: 0,
    });

    // Award points for posting
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      const pointsToAward = args.type === "verse" ? 20 : args.type === "prayer" ? 15 : 10;
      await ctx.db.patch(profile._id, {
        points: profile.points + pointsToAward,
      });

      await ctx.db.insert("pointTransactions", {
        userId,
        points: pointsToAward,
        action: "post",
        description: `Posted a ${args.type} 📝`,
      });
    }

    return postId;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    const posts = await ctx.db
      .query("posts")
      .order("desc")
      .take(20);

    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", post.authorId))
          .unique();

        // Get profile photo URL if it exists
        let profilePhotoUrl = null;
        if (profile?.profilePhotoId) {
          profilePhotoUrl = await ctx.storage.getUrl(profile.profilePhotoId);
        }

        // Get post photo URL if it exists
        let postPhotoUrl = null;
        if (post.photoId) {
          postPhotoUrl = await ctx.storage.getUrl(post.photoId);
        }

        // Get follower count for the author
        const followers = await ctx.db
          .query("follows")
          .withIndex("by_following", (q) => q.eq("followingId", post.authorId))
          .collect();

        return {
          ...post,
          author: profile?.displayName || "Unknown",
          authorProfile: profile ? { ...profile, profilePhotoUrl } : null,
          authorFollowerCount: followers.length,
          isOwnPost: currentUserId === post.authorId,
          postPhotoUrl,
        };
      })
    );

    return postsWithAuthors;
  },
});

export const getPostComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .collect();

    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", comment.authorId))
          .unique();

        // Get profile photo URL if it exists
        let profilePhotoUrl = null;
        if (profile?.profilePhotoId) {
          profilePhotoUrl = await ctx.storage.getUrl(profile.profilePhotoId);
        }

        // Check if current user has liked this comment
        let hasLiked = false;
        if (currentUserId) {
          const existingLike = await ctx.db
            .query("likes")
            .withIndex("by_user_comment", (q) => q.eq("userId", currentUserId).eq("commentId", comment._id))
            .unique();
          hasLiked = !!existingLike;
        }

        // Get replies for this comment
        const replies = await ctx.db
          .query("commentReplies")
          .withIndex("by_comment", (q) => q.eq("commentId", comment._id))
          .order("asc")
          .collect();

        const repliesWithAuthors = await Promise.all(
          replies.map(async (reply) => {
            const replyProfile = await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", reply.authorId))
              .unique();

            let replyProfilePhotoUrl = null;
            if (replyProfile?.profilePhotoId) {
              replyProfilePhotoUrl = await ctx.storage.getUrl(replyProfile.profilePhotoId);
            }

            return {
              ...reply,
              author: replyProfile?.displayName || "Unknown",
              authorProfile: replyProfile ? { ...replyProfile, profilePhotoUrl: replyProfilePhotoUrl } : null,
            };
          })
        );

        return {
          ...comment,
          author: profile?.displayName || "Unknown",
          authorProfile: profile ? { ...profile, profilePhotoUrl } : null,
          hasLiked,
          replies: repliesWithAuthors,
        };
      })
    );

    return commentsWithAuthors;
  },
});

export const searchUsers = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.query.length < 2) return [];
    
    const profiles = await ctx.db
      .query("userProfiles")
      .collect();

    const filteredProfiles = profiles
      .filter(profile => 
        profile.displayName.toLowerCase().includes(args.query.toLowerCase())
      )
      .slice(0, 5);

    const profilesWithPhotos = await Promise.all(
      filteredProfiles.map(async (profile) => {
        let profilePhotoUrl = null;
        if (profile.profilePhotoId) {
          profilePhotoUrl = await ctx.storage.getUrl(profile.profilePhotoId);
        }
        return {
          ...profile,
          profilePhotoUrl,
        };
      })
    );

    return profilesWithPhotos;
  },
});

export const likePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if already liked
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_post", (q) => q.eq("userId", userId).eq("postId", args.postId))
      .unique();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      
      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(args.postId, {
          likes: Math.max(0, post.likes - 1),
        });
      }
      return false;
    } else {
      // Like
      await ctx.db.insert("likes", {
        userId,
        postId: args.postId,
        type: "post",
      });

      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(args.postId, {
          likes: post.likes + 1,
        });

        // Award points to post author
        const authorProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", post.authorId))
          .unique();

        if (authorProfile) {
          await ctx.db.patch(authorProfile._id, {
            points: authorProfile.points + 5,
          });

          await ctx.db.insert("pointTransactions", {
            userId: post.authorId,
            points: 5,
            action: "like_received",
            description: "Someone liked your post! ❤️",
          });
        }
      }
      return true;
    }
  },
});

export const likeComment = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if already liked
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_comment", (q) => q.eq("userId", userId).eq("commentId", args.commentId))
      .unique();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      
      const comment = await ctx.db.get(args.commentId);
      if (comment) {
        await ctx.db.patch(args.commentId, {
          likes: Math.max(0, comment.likes - 1),
        });
      }
      return false;
    } else {
      // Like
      await ctx.db.insert("likes", {
        userId,
        commentId: args.commentId,
        type: "comment",
      });

      const comment = await ctx.db.get(args.commentId);
      if (comment) {
        await ctx.db.patch(args.commentId, {
          likes: comment.likes + 1,
        });

        // Award points to comment author
        const authorProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", comment.authorId))
          .unique();

        if (authorProfile) {
          await ctx.db.patch(authorProfile._id, {
            points: authorProfile.points + 5,
          });

          await ctx.db.insert("pointTransactions", {
            userId: comment.authorId,
            points: 5,
            action: "comment_like_received",
            description: "Someone liked your comment! ❤️",
          });
        }
      }
      return true;
    }
  },
});

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    mentionedUsers: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: userId,
      content: args.content,
      likes: 0,
      mentionedUsers: args.mentionedUsers || [],
    });

    // Update post comment count
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        comments: post.comments + 1,
      });
    }

    // Award points for commenting
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        points: profile.points + 5,
      });

      await ctx.db.insert("pointTransactions", {
        userId,
        points: 5,
        action: "comment",
        description: "Added a comment 💬",
      });
    }

    return commentId;
  },
});

export const addCommentReply = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
    mentionedUsers: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const replyId = await ctx.db.insert("commentReplies", {
      commentId: args.commentId,
      authorId: userId,
      content: args.content,
      mentionedUsers: args.mentionedUsers || [],
    });

    // Award points for replying
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        points: profile.points + 5,
      });

      await ctx.db.insert("pointTransactions", {
        userId,
        points: 5,
        action: "reply",
        description: "Replied to a comment 💬",
      });
    }

    return replyId;
  },
});