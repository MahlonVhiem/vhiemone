import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createProfile = mutation({
  args: {
    role: v.union(v.literal("shopper"), v.literal("business"), v.literal("delivery_driver")),
    displayName: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const clerkUserId = identity.subject;

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
      .unique();

    let convexUserId;
    if (!user) {
      convexUserId = await ctx.db.insert("users", {
        clerkId: clerkUserId,
        name: identity.name ?? "unknown user",
        email: identity.email!,
        profilePhoto: identity.profileUrl,
        nickname: identity.nickname,
        given_name: identity.givenName,
        updated_at: Date.parse(identity.updatedAt!),
        family_name: identity.familyName,
        phone_number: identity.phoneNumber,
        email_verified: identity.emailVerified,
        phone_number_verified: identity.phoneNumberVerified,
      });
      user = await ctx.db.get(convexUserId);
    } else {
      convexUserId = user._id;
    }

    if (!user) {
      throw new Error("User not found and could not be created.");
    }

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", convexUserId))
      .unique();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    const profileId = await ctx.db.insert("userProfiles", {
      userId: convexUserId,
      role: args.role,
      displayName: args.displayName,
      bio: args.bio,
      points: 100, // Welcome bonus
      level: 1,
      badges: ["newcomer"],
      joinedAt: Date.now(),
    });

    await ctx.db.insert("pointTransactions", {
      userId: convexUserId,
      points: 100,
      action: "welcome",
      description: "Welcome to Vhiem! 🙏",
    });

    return profileId;
  },
});

export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
      .unique();

    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) {
      return null;
    }

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

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("userProfiles")
      .order("desc")
      .take(10);

    const sortedProfiles = profiles.sort((a, b) => b.points - a.points);

    const profilesWithPhotos = await Promise.all(
      sortedProfiles.map(async (profile) => {
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

export const awardPoints = mutation({
  args: {
    points: v.number(),
    action: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const newPoints = profile.points + args.points;
    const newLevel = Math.floor(newPoints / 1000) + 1;

    await ctx.db.patch(profile._id, {
      points: newPoints,
      level: newLevel,
    });

    await ctx.db.insert("pointTransactions", {
      userId: user._id,
      points: args.points,
      action: args.action,
      description: args.description,
    });

    return { newPoints, newLevel };
  },
});

export const followUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const clerkUserId = identity.subject;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
      .unique();

    if (!currentUser) {
      throw new Error("Current user not found");
    }

    if (currentUser._id === args.userId) {
      throw new Error("Cannot follow yourself");
    }

    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();

    if (existingFollow) {
      return false;
    }

    await ctx.db.insert("follows", {
      followerId: currentUser._id,
      followingId: args.userId,
    });

    return true;
  },
});

export const unfollowUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const clerkUserId = identity.subject;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
      .unique();

    if (!currentUser) {
      throw new Error("Current user not found");
    }

    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();

    if (!existingFollow) {
      return false;
    }

    await ctx.db.delete(existingFollow._id);
    return true;
  },
});

export const isFollowing = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }
    const currentClerkId = identity.subject;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", currentClerkId))
      .unique();

    if (!currentUser) {
      return false;
    }

    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();

    return !!existingFollow;
  },
});

export const getFollowCounts = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    return {
      followers: followers.length,
      following: following.length,
    };
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const currentClerkId = identity?.subject;

    let currentUser = null;
    if (currentClerkId) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", currentClerkId))
        .unique();
    }

    const profiles = await ctx.db.query("userProfiles").order("desc").take(50);

    const usersWithFollowStatus = await Promise.all(
      profiles.map(async (profile) => {
        let isFollowing = false;
        if (currentUser && currentUser._id !== profile.userId) {
          const followRecord = await ctx.db
            .query("follows")
            .withIndex("by_follower_following", (q) =>
              q.eq("followerId", currentUser!._id).eq("followingId", profile.userId)
            )
            .unique();
          isFollowing = !!followRecord;
        }

        let profilePhotoUrl = null;
        if (profile.profilePhotoId) {
          profilePhotoUrl = await ctx.storage.getUrl(profile.profilePhotoId);
        }

        return {
          ...profile,
          profilePhotoUrl,
          isFollowing,
          canFollow: currentUser && currentUser._id !== profile.userId,
        };
      })
    );

    return usersWithFollowStatus;
  },
});
