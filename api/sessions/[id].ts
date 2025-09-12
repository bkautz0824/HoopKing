import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../../lib/auth';
import { storage } from '../../lib/database';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/').pop();
    
    if (!sessionId) {
      return Response.json({ message: "Session ID is required" }, { status: 400 });
    }

    if (request.method === 'PATCH') {
      const userId = user.claims.sub;
      const body = await request.json();
      
      // Verify session belongs to user
      const sessions = await storage.getUserWorkoutSessions(userId);
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        return Response.json({ message: "Session not found" }, { status: 404 });
      }

      const updatedSession = await storage.updateWorkoutSession(sessionId, body);
      
      // Update user stats if session was completed
      if (body.status === 'completed' && body.completedAt) {
        const profile = await storage.getUserProfile(userId);
        if (profile) {
          await storage.updateUserProfile(userId, {
            totalWorkouts: (profile.totalWorkouts || 0) + 1,
            lastWorkoutDate: new Date(body.completedAt)
          });
        }
      }
      
      return Response.json(updatedSession);
    }
    
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error("Error updating session:", error);
    return Response.json({ message: "Failed to update session" }, { status: 500 });
  }
});

export { handler as PATCH };