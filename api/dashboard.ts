import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../lib/auth';
import { storage } from '../lib/database';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const userId = user.claims.sub;
    const [stats, achievements, leaderboard, activityFeed] = await Promise.all([
      storage.getUserStats(userId),
      storage.getUserAchievements(userId),
      storage.getLeaderboard(10),
      storage.getActivityFeed(userId, 10),
    ]);

    return Response.json({
      stats,
      achievements,
      leaderboard,
      activityFeed,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return Response.json({ message: "Failed to fetch dashboard data" }, { status: 500 });
  }
});

export { handler as GET };