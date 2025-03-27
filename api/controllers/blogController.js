import prisma from "../../prisma/client.js";

//* Create a blog
export async function createBlog(req, res) {
  try {
    const { title, subtitle, content, authorId } = req.body;
    console.log("Attempting to create blog");

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        subtitle,
        author: { connect: { id: authorId } },
      },
      include: {
        author: true,
        comments: true,
        likes: true,
      },
    });

    console.log("Blog created successfully:", blog.id);
    res.status(201).json(blog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ error: "Failed to create blog" });
  }
}

//* Get blogs
export async function getBlogs(req, res) {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;

    const blogs = await prisma.blog.findMany({
      include: {
        author: true,
        comments: true,
        likes: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      skip,
      take: parseInt(pageSize),
    });

    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//* Get blog by ID
export async function getBlogById(req, res) {
  try {
    const { blogId } = req.params;
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        author: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: true,
      },
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//* Update a blog
export async function updateBlog(req, res) {
  try {
    const { blogId } = req.params;
    const { title, content } = req.body;

    const blog = await prisma.blog.update({
      where: { id: blogId },
      data: { title, content },
      include: {
        author: true,
        comments: true,
        likes: true,
      },
    });

    res.json(blog);
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ error: "Failed to update blog" });
  }
}

//* Delete a blog
export async function deleteBlog(req, res) {
  try {
    const { blogId } = req.params;
    console.log("Attempting to delete blog");

    const deletedBlog = await prisma.blog.delete({
      where: { id: blogId },
      include: {
        author: true,
        comments: true,
        likes: true,
      },
    });

    console.log("Blog deleted successfully:", deletedBlog.id);
    res.json(deletedBlog);
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
}
