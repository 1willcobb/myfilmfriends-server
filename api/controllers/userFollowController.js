import prisma from "../../prisma/client.js";

export async function followUser(req, res) {
  const { followerId, followedId } = req.body;

  try {
    const follow = await prisma.userFollow.create({
      data: {
        follower: { connect: { id: followerId } },
        followedUser: { connect: { id: followedId } },
      },
      include: {
        follower: true,
        followedUser: true,
      },
    });

    await prisma.user.update({
      where: { id: followerId },
      data: { followingCount: { increment: 1 } },
    });

    await prisma.user.update({
      where: { id: followedId },
      data: { followerCount: { increment: 1 } },
    });

    res.status(201).json(follow);
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Failed to follow user" });
  }
}

export async function unfollowUser(req, res) {
  const { followerId, followedId } = req.params;

  try {
    const follow = await prisma.userFollow.findFirst({
      where: {
        followerId,
        followedId,
      },
    });

    if (!follow) {
      return res.status(404).json({ message: "Follow relationship not found" });
    }

    const deletedFollow = await prisma.userFollow.delete({
      where: { id: follow.id },
      include: {
        follower: true,
        followedUser: true,
      },
    });

    await prisma.user.update({
      where: { id: followerId },
      data: { followingCount: { decrement: 1 } },
    });

    await prisma.user.update({
      where: { id: followedId },
      data: { followerCount: { decrement: 1 } },
    });

    res.status(200).json(deletedFollow);
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Failed to unfollow user" });
  }
}

export async function getFollowers(req, res) {
  const { userId } = req.params;

  try {
    const followers = await prisma.userFollow.findMany({
      where: { followedId: userId },
      include: {
        follower: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Failed to fetch followers" });
  }
}

export async function getFollowing(req, res) {
  const { userId } = req.params;

  try {
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      include: {
        followedUser: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(following);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ message: "Failed to fetch following" });
  }
}
