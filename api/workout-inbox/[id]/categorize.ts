import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../../../lib/auth';
import { storage } from '../../../lib/database';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const userId = user.claims.sub;
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const itemId = pathParts[pathParts.length - 2]; // Gets the id from /api/workout-inbox/[id]/categorize
    
    if (!itemId) {
      return Response.json({ message: "Item ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { category } = body;
    
    const updatedItem = await storage.categorizeWorkoutInboxItem(itemId, userId, category);
    return Response.json(updatedItem);
  } catch (error) {
    console.error("Error categorizing workout:", error);
    return Response.json({ message: "Failed to categorize workout" }, { status: 500 });
  }
});

export { handler as POST };