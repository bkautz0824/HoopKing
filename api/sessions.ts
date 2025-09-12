import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../lib/auth';
import { storage } from '../lib/database';
import { insertWorkoutSessionSchema } from '@shared/schema';
import { z } from 'zod';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    if (request.method === 'POST') {
      const userId = user.claims.sub;
      const body = await request.json();
      
      const sessionData = insertWorkoutSessionSchema.parse({
        ...body,
        userId,
      });

      const session = await storage.createWorkoutSession(sessionData);
      return Response.json(session);
    }
    
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Invalid session data", errors: error.errors }, { status: 400 });
    }
    console.error("Error creating session:", error);
    return Response.json({ message: "Failed to create session" }, { status: 500 });
  }
});

export { handler as POST };