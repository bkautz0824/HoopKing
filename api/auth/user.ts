import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../../lib/auth';
import { storage } from '../../lib/database';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const userId = user.claims.sub;
    const userData = await storage.getUser(userId);
    const profile = await storage.getUserProfile(userId);
    
    return Response.json({ ...userData, profile });
  } catch (error) {
    console.error("Error fetching user:", error);
    return Response.json({ message: "Failed to fetch user" }, { status: 500 });
  }
});

export { handler as GET };