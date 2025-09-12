import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../../../lib/auth';
import { storage } from '../../../lib/database';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const userId = user.claims.sub;
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const itemId = pathParts[pathParts.length - 2]; // Gets the id from /api/workout-inbox/[id]/ignore
    
    if (!itemId) {
      return Response.json({ message: "Item ID is required" }, { status: 400 });
    }
    
    const updatedItem = await storage.ignoreWorkoutInboxItem(itemId, userId);
    return Response.json(updatedItem);
  } catch (error) {
    console.error("Error ignoring workout:", error);
    return Response.json({ message: "Failed to ignore workout" }, { status: 500 });
  }
});

export { handler as POST };