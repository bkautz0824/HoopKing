import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../lib/auth';
import { storage } from '../lib/database';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const userId = user.claims.sub;
    
    if (request.method === 'GET') {
      const userPlans = await storage.getUserActivePlans(userId);
      return Response.json(userPlans);
    }
    
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error("Error fetching user plans:", error);
    return Response.json({ message: "Failed to fetch user plans" }, { status: 500 });
  }
});

export { handler as GET };