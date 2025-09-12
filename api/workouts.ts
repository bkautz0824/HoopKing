import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../lib/auth';
import { storage } from '../lib/database';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const workouts = await storage.getWorkouts(20);
    return Response.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return Response.json({ message: "Failed to fetch workouts" }, { status: 500 });
  }
});

export { handler as GET };