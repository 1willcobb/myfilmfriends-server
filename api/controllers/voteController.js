import prisma from "../../prisma/client.js";

//* Create a vote
export async function createVote(req, res) {
  try {
    const { userId, postId } = req.body;
    console.log("Attempting to create vote");

    const vote = await prisma.vote.create({
      data: { userId, postId },
    });

    await prisma.post.update({
      where: { id: postId },
      data: { voteCount: { increment: 1 } },
    });

    console.log("Vote created successfully:", vote.id);
    res.status(201).json(vote);
  } catch (error) {
    console.error("Error creating vote:", error);
    res.status(500).json({ error: "Failed to create vote" });
  }
}

//* Get votes by post
export async function getVotesByPost(req, res) {
  try {
    const { postId } = req.params;
    const votes = await prisma.vote.findMany({
      where: { postId },
      include: { user: true, post: true },
    });

    res.json(votes);
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//* Delete a vote
export async function deleteVote(req, res) {
  try {
    const { userId, postId } = req.body;
    console.log("Attempting to delete vote");

    const vote = await prisma.vote.findFirst({
      where: { userId, postId },
    });

    if (!vote) {
      return res.status(404).json({ error: "Vote not found" });
    }

    await prisma.vote.delete({ where: { id: vote.id } });

    await prisma.post.update({
      where: { id: postId },
      data: { voteCount: { decrement: 1 } },
    });

    res.json({ message: "Vote deleted successfully" });
  } catch (error) {
    console.error("Error deleting vote:", error);
    res.status(500).json({ error: "Failed to delete vote" });
  }
}

//* Check if user has voted
export async function hasUserVoted(req, res) {
  try {
    const { userId, postId } = req.body;
    
    const vote = await prisma.vote.findFirst({
      where: { userId, postId },
    });

    res.json({ hasVoted: !!vote });
  } catch (error) {
    console.error("Error checking vote:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
