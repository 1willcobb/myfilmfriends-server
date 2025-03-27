import prisma from "../../prisma/client.js";

export async function getUserFeed(req, res) {
  const { userId } = req.params;
  const { page = 1, pageSize = 10 } = req.query;

  const safePage = Math.max(1, isNaN(page) ? 1 : page);
  const safePageSize = Math.max(1, isNaN(pageSize) ? 10 : pageSize);

  const skip = (safePage - 1) * safePageSize;

  try {
    // Get the list of userIds that the current user is following
    const followedUsers = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followedId: true },
    });

    const followedUserIds = followedUsers.map((follow) => follow.followedId);
    const userAndFollowedIds = [...followedUserIds, userId];

    // Get the posts from those followed users with pagination
    const feedPosts = await prisma.post.findMany({
      where: {
        userId: {
          in: userAndFollowedIds,
        },
      },
      orderBy: {
        createdAt: "desc", // Sort posts chronologically
      },
      include: {
        user: true,
        comments: true,
        likes: true,
        votes: true,
      },
      skip: skip,
      take: safePageSize + 1, // Fetch one more than needed to check if there's a next page
    });

    // Check if there's a next page
    const hasMore = feedPosts.length > safePageSize;

    // If we got more than pageSize items, remove the extra one before returning
    if (hasMore) {
      feedPosts.pop();
    }

    res.json({ posts: feedPosts, hasMore, pageSize: safePageSize });
  } catch (error) {
    console.error("Error fetching user feed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function createPost(req, res) {
  const { content, imageUrl, userId, lens, filmStock, camera, settings } = req.body;

  try {
    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        user: {
          connect: { id: userId },
        },
        lens,
        filmStock,
        camera,
        settings,
      },
      include: {
        user: true,
        comments: true,
        likes: true,
        votes: true,
      },
    });

    // Increment postCount for the user
    await prisma.user.update({
      where: { id: userId },
      data: { postCount: { increment: 1 } },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getUserPosts(req, res) {
  const { userId } = req.params;
  const { page = 1, pageSize = 10 } = req.query;

  const safePage = Math.max(1, isNaN(page) ? 1 : page);
  const safePageSize = Math.max(1, isNaN(pageSize) ? 10 : pageSize);

  const skip = (safePage - 1) * safePageSize;

  try {
    const posts = await prisma.post.findMany({
      where: {
        userId: userId, // Filter posts by the specific user
      },
      orderBy: {
        createdAt: "desc", // Sort posts chronologically
      },
      include: {
        user: true,
        comments: true,
        likes: true,
        votes: true,
      },
      skip: skip,
      take: safePageSize + 1, // Fetch one more than needed to check if there's a next page
    });

    const hasMore = posts.length > safePageSize;

    if (hasMore) {
      posts.pop();
    }

    res.json({ posts, hasMore, pageSize: safePageSize });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// posts.js

const prisma = require('./prisma'); // Assuming you're using Prisma to interact with the database

// Update Post
export async function updatePost(req, res) {
  const { postId, content, imageUrl } = req.body;

  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        content,
        imageUrl,
      },
      include: {
        user: true,
        comments: true,
        likes: true,
        votes: true,
      },
    });

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update post" });
  }
}

// Delete Post
export async function deletePost(req, res) {
  const { postId } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const deletedPost = await prisma.post.delete({
      where: { id: postId },
      include: {
        user: true,
        comments: true,
        likes: true,
        votes: true,
      },
    });

    await prisma.user.update({
      where: { id: post.userId },
      data: { postCount: { decrement: 1 } },
    });

    return res.json(deletedPost);
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete post" });
  }
}

// Get Post by ID
export async function getPostById(req, res) {
  const { postId } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: true,
        comments: true,
        likes: true,
        votes: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get post" });
  }
}

// Get Monthly Top Posts
export async function getMonthlyTopPosts(req, res) {
  const { page = 1, pageSize = 10 } = req.query;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

  const skip = (page - 1) * pageSize;

  try {
    const topPosts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
        voteCount: {
          gt: 0,
        },
      },
      orderBy: {
        voteCount: "desc",
      },
      skip,
      take: pageSize,
      include: {
        user: true,
        comments: true,
        likes: true,
        votes: true,
      },
    });

    return res.json(topPosts);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get monthly top posts" });
  }
}

// Get Surrounding Monthly Posts
export async function getSurroundingMonthlyPosts(req, res) {
  const { postId } = req.params;

  try {
    const currentPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { createdAt: true },
    });

    if (!currentPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    const currentYear = currentPost.createdAt.getFullYear();
    const currentMonth = currentPost.createdAt.getMonth();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

    const previousPosts = await prisma.post.findMany({
      where: {
        createdAt: {
          lt: currentPost.createdAt,
          gte: startOfMonth,
        },
        voteCount: {
          gt: 0,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 2,
      include: {
        user: true,
        comments: true,
        likes: true,
        votes: true,
      },
    });

    const nextPosts = await prisma.post.findMany({
      where: {
        createdAt: {
          gt: currentPost.createdAt,
          lt: endOfMonth,
        },
        voteCount: {
          gt: 0,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 2,
      include: {
        user: true,
        comments: true,
        likes: true,
        votes: true,
      },
    });

    return res.json({ previousPosts, nextPosts });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get surrounding posts" });
  }
}

// Get Previous Monthly Posts
export async function getPreviousMonthlyPosts(req, res) {
  const { postId, lastPostDate } = req.params;

  const date = new Date(lastPostDate);
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  const startOfMonth = new Date(currentYear, currentMonth, 1);

  try {
    const previousPosts = await prisma.post.findMany({
      where: {
        createdAt: {
          lt: date,
          gte: startOfMonth,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 2,
      include: {
        user: true,
        comments: true,
        likes: true,
        votes: true,
      },
    });

    return res.json(previousPosts);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get previous posts" });
  }
}

// Get Next Monthly Posts
export async function getNextMonthlyPosts(req, res) {
  const { postId, lastPostDate } = req.params;

  const date = new Date(lastPostDate);
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

  try {
    const nextPosts = await prisma.post.findMany({
      where: {
        createdAt: {
          gt: date,
          lt: endOfMonth,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 2,
      include: {
        user: true,
        comments: true,
        likes: true,
        votes: true,
      },
    });

    return res.json(nextPosts);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get next posts" });
  }
}

