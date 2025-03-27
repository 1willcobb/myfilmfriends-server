import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  // Seed user data
  const users = [
    {
      email: "alice@remix.run",
      username: "alice",
      password: "aliceiscool",
      profileImage: "https://d3hspsrf978pst.cloudfront.net/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.webp",
      isAdmin: true,
    },
    {
      email: "bob@remix.run",
      username: "bob",
      password: "bobiscool",
      profileImage: "https://d3hspsrf978pst.cloudfront.net/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.webp",
      isAdmin: false,
    },
    {
      email: "charlie@remix.run",
      username: "charlie",
      password: "charlieiscool",
      profileImage: "https://d3hspsrf978pst.cloudfront.net/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.webp",
      isAdmin: false,
    },
  ];

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          isAdmin: userData.isAdmin,
          password: {
            create: {
              hash: hashedPassword,
            },
          },
          postCount: 0,
          followerCount: 0,
          followingCount: 0,
        },
      });

      const posts = [
        {
          content: `Hello, world! This is ${user.username}'s first post.`,
        },
        {
          content: `Another post from ${user.username}.`,
        },
      ];

      for (const postData of posts) {
        const post = await prisma.post.create({
          data: {
            content: postData.content,
            user: { connect: { id: user.id } },
            likeCount: 0,
            commentCount: 0,
            voteCount: 0,
          },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: {
            postCount: {
              increment: 1,
            },
          },
        });

        const comment = await prisma.comment.create({
          data: {
            content: `This is a comment by ${user.username} on a post.`,
            user: { connect: { id: user.id } },
            post: { connect: { id: post.id } },
          },
        });

        await prisma.post.update({
          where: { id: post.id },
          data: {
            commentCount: {
              increment: 1,
            },
          },
        });
      }

      const postsForLikes = await prisma.post.findMany({ where: { userId: user.id } });
      for (const post of postsForLikes) {
        await prisma.like.create({
          data: {
            user: { connect: { id: user.id } },
            post: { connect: { id: post.id } },
          },
        });

        await prisma.post.update({
          where: { id: post.id },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        });
      }

      const postsForVotes = await prisma.post.findMany({ where: { userId: user.id } });
      for (const post of postsForVotes) {
        await prisma.vote.create({
          data: {
            user: { connect: { id: user.id } },
            post: { connect: { id: post.id } },
            value: 1,
          },
        });

        await prisma.post.update({
          where: { id: post.id },
          data: {
            voteCount: {
              increment: 1,
            },
          },
        });
      }

      if (user.isAdmin) {
        const blog = await prisma.blog.create({
          data: {
            title: `${user.username}'s Blog Post`,
            content: `This is an admin blog post by ${user.username}.`,
            author: { connect: { id: user.id } },
            likeCount: 0,
            commentCount: 0,
          },
        });

        const blogComment = await prisma.comment.create({
          data: {
            content: `This is a comment by ${user.username} on a blog.`,
            user: { connect: { id: user.id } },
            blog: { connect: { id: blog.id } },
          },
        });

        await prisma.blog.update({
          where: { id: blog.id },
          data: {
            commentCount: {
              increment: 1,
            },
          },
        });

        await prisma.like.create({
          data: {
            user: { connect: { id: user.id } },
            blog: { connect: { id: blog.id } },
          },
        });

        await prisma.blog.update({
          where: { id: blog.id },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        });
      }
    }
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
