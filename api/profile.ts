import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../lib/auth';
import { storage } from '../lib/database';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const userId = user.claims.sub;
    const profile = await storage.getUserProfile(userId);
    
    return Response.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ message: "Failed to fetch profile" }, { status: 500 });
  }
});

export { handler as GET };