import prisma from "../../prisma/client.js";

// Create a new comment
export async function createComment(req, res) {
  const { content, userId, postId, blogId } = req.body;

  if (!postId && !blogId) {
    return res.status(400).json({ error: "Either postId or blogId must be provided." });
  }

  try {
    // Validate if the blog or post exists
    if (blogId) {
      const blogExists = await prisma.blog.findUnique({ where: { id: blogId } });
      if (!blogExists) return res.status(404).json({ error: "Blog not found." });
    }

    if (postId) {
      const postExists = await prisma.post.findUnique({ where: { id: postId } });
      if (!postExists) return res.status(404).json({ error: "Post not found." });
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        user: { connect: { id: userId } },
        post: postId ? { connect: { id: postId } } : undefined,
        blog: blogId ? { connect: { id: blogId } } : undefined,
      },
      include: {
        user: true,
        post: true,
        blog: true,
      },
    });

    // Increment commentCount in the respective entity
    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });
    } else if (blogId) {
      await prisma.blog.update({
        where: { id: blogId },
        data: { commentCount: { increment: 1 } },
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment." });
  }
}

// Retrieve comments for a post or blog with pagination
export async function getCommentsByEntity(req, res) {
  const { postId, blogId } = req.query;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const skip = (page - 1) * pageSize;

  if (!postId && !blogId) {
    return res.status(400).json({ error: "Either postId or blogId must be provided." });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId || undefined,
        blogId: blogId || undefined,
      },
      include: {
        user: true,
        post: true,
        blog: true,
      },
      orderBy: { createdAt: "asc" },
      skip,
      take: pageSize,
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({ error: "Failed to retrieve comments." });
  }
}

// Update a comment
export async function updateComment(req, res) {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: true,
        post: true,
        blog: true,
      },
    });

    res.status(200).json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment." });
  }
}

// Delete a comment
export async function deleteComment(req, res) {
  const { commentId } = req.params;
  const { postId, blogId } = req.query;

  try {
    const comment = await prisma.comment.delete({
      where: { id: commentId },
      include: {
        user: true,
        post: true,
        blog: true,
      },
    });

    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: { commentCount: { decrement: 1 } },
      });
    } else if (blogId) {
      await prisma.blog.update({
        where: { id: blogId },
        data: { commentCount: { decrement: 1 } },
      });
    }

    res.status(200).json({ message: "Comment deleted successfully", deletedComment: comment });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment." });
  }
}
