import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      return null;
    }

    // Get profile photo URL if it exists
    let profilePhotoUrl = null;
    if (profile.profilePhotoId) {
      profilePhotoUrl = await ctx.storage.getUrl(profile.profilePhotoId);
    }

    return {
      ...profile,
      profilePhotoUrl,
    };
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    businessName: v.optional(v.string()),
    businessCategory: v.optional(v.string()),
    businessHours: v.optional(v.string()),
    businessServices: v.optional(v.array(v.string())),
    vehicleType: v.optional(v.string()),
    deliveryRadius: v.optional(v.number()),
    availability: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    favoriteVerses: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Filter out undefined values
    const updates = Object.fromEntries(
      Object.entries(args).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(profile._id, updates);
    return true;
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

export const updateProfilePhoto = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Delete old profile photo if it exists
    if (profile.profilePhotoId) {
      await ctx.storage.delete(profile.profilePhotoId);
    }

    await ctx.db.patch(profile._id, {
      profilePhotoId: args.storageId,
    });

    return true;
  },
});

export const removeProfilePhoto = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Delete the profile photo from storage
    if (profile.profilePhotoId) {
      await ctx.storage.delete(profile.profilePhotoId);
    }

    await ctx.db.patch(profile._id, {
      profilePhotoId: undefined,
    });

    return true;
  },
});

export const getProfileById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) {
      return null;
    }

    // Get profile photo URL if it exists
    let profilePhotoUrl = null;
    if (profile.profilePhotoId) {
      profilePhotoUrl = await ctx.storage.getUrl(profile.profilePhotoId);
    }

    // Get follow counts
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    // Check if current user is following this profile
    const currentUserId = await getAuthUserId(ctx);
    let isFollowing = false;
    if (currentUserId && currentUserId !== args.userId) {
      const followRecord = await ctx.db
        .query("follows")
        .withIndex("by_follower_following", (q) => 
          q.eq("followerId", currentUserId).eq("followingId", args.userId)
        )
        .unique();
      isFollowing = !!followRecord;
    }

    return {
      ...profile,
      profilePhotoUrl,
      followerCount: followers.length,
      followingCount: following.length,
      isFollowing,
      canFollow: currentUserId && currentUserId !== args.userId,
      isOwnProfile: currentUserId === args.userId,
    };
  },
});