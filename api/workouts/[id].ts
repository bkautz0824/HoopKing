import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../../lib/auth';
import { storage } from '../../lib/database';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return Response.json({ message: "Workout ID is required" }, { status: 400 });
    }

    const workout = await storage.getWorkoutById(id);
    if (!workout) {
      return Response.json({ message: "Workout not found" }, { status: 404 });
    }
    
    return Response.json(workout);
  } catch (error) {
    console.error("Error fetching workout:", error);
    return Response.json({ message: "Failed to fetch workout" }, { status: 500 });
  }
});

export { handler as GET };