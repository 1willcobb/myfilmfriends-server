import prisma from "../../prisma/client.js";

// Get all likes for a specific post, comment, or blog
export async function getLikesByEntity(req, res) {
  const { postId, commentId, blogId, page = 1, pageSize = 10 } = req.query;
  const skip = (page - 1) * pageSize;

  try {
    const likes = await prisma.like.findMany({
      where: {
        postId: postId || undefined,
        commentId: commentId || undefined,
        blogId: blogId || undefined,
      },
      orderBy: {
        createdAt: "asc", // Sort likes chronologically
      },
      include: {
        user: true,
        post: true,
        comment: true,
        blog: true,
      },
      skip: skip,
      take: parseInt(pageSize) + 1, // Fetch one extra to check if there's a next page
    });

    const hasNextPage = likes.length > pageSize;
    if (hasNextPage) {
      likes.pop();
    }

    res.json({ likes, hasNextPage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Check if a user has already liked a specific post, comment, or blog
export async function hasUserLiked(req, res) {
  const { userId, postId, commentId, blogId } = req.query;

  try {
    const like = await prisma.like.findFirst({
      where: {
        userId,
        postId: postId || undefined,
        commentId: commentId || undefined,
        blogId: blogId || undefined,
      },
    });

    res.json({ liked: !!like });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Create a new like
export async function createLike(req, res) {
  const { userId, postId, commentId, blogId } = req.body;

  try {
    const alreadyLiked = await hasUserLiked({ userId, postId, commentId, blogId });

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: "User has already liked this entity",
      });
    }

    const like = await prisma.like.create({
      data: {
        user: { connect: { id: userId } },
        post: postId ? { connect: { id: postId } } : undefined,
        comment: commentId ? { connect: { id: commentId } } : undefined,
        blog: blogId ? { connect: { id: blogId } } : undefined,
      },
      include: {
        user: true,
        post: true,
        comment: true,
        blog: true,
      },
    });

    // Update the likeCount for the associated entity
    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      });
    } else if (commentId) {
      await prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      });
    } else if (blogId) {
      await prisma.blog.update({
        where: { id: blogId },
        data: { likeCount: { increment: 1 } },
      });
    }

    res.json({ success: true, like });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Delete a like
export async function deleteLike(req, res) {
  const { userId, postId, commentId, blogId } = req.params;

  try {
    let likeId;
    if (postId) {
      const like = await prisma.like.findFirst({
        where: { userId, postId },
      });
      likeId = like.id;
    } else if (commentId) {
      const like = await prisma.like.findFirst({
        where: { userId, commentId },
      });
      likeId = like.id;
    } else if (blogId) {
      const like = await prisma.like.findFirst({
        where: { userId, blogId },
      });
      likeId = like.id;
    }

    const like = await prisma.like.delete({
      where: { id: likeId },
      include: {
        user: true,
        post: true,
        comment: true,
        blog: true,
      },
    });

    // Update the likeCount for the associated entity
    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
    } else if (commentId) {
      await prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
      });
    } else if (blogId) {
      await prisma.blog.update({
        where: { id: blogId },
        data: { likeCount: { decrement: 1 } },
      });
    }

    res.json({ success: true, like });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get a like by ID
export async function getLikeById(req, res) {
  const { likeId } = req.params;

  try {
    const like = await prisma.like.findUnique({
      where: { id: likeId },
      include: {
        user: true,
        post: true,
        comment: true,
        blog: true,
      },
    });

    if (!like) {
      return res.status(404).json({ success: false, message: "Like not found" });
    }

    res.json({ like });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
