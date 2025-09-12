import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../../lib/auth';
import { storage } from '../../lib/database';
import { aiTrainerService } from '../../server/services/aiTrainer';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const userId = user.claims.sub;
    const sessions = await storage.getUserWorkoutSessions(userId, 5);
    const profile = await storage.getUserProfile(userId);
    
    const insights = await aiTrainerService.generateInsights({
      recentSessions: sessions,
      userProfile: profile,
    });

    return Response.json(insights);
  } catch (error) {
    console.error("Error generating AI workout insights:", error);
    return Response.json({ message: "Failed to generate AI workout insights" }, { status: 500 });
  }
});

export { handler as POST };