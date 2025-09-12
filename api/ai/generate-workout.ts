import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../../lib/auth';
import { storage } from '../../lib/database';
import { aiTrainerService } from '../../server/services/aiTrainer';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const userId = user.claims.sub;
    const body = await request.json();
    
    const profile = await storage.getUserProfile(userId);
    const stats = await storage.getUserStats(userId);
    
    const workout = await aiTrainerService.generatePersonalizedWorkout({
      userProfile: profile,
      userStats: stats,
      preferences: body.preferences || {},
    });

    return Response.json(workout);
  } catch (error) {
    console.error("Error generating AI workout:", error);
    return Response.json({ message: "Failed to generate AI workout" }, { status: 500 });
  }
});

export { handler as POST };