import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../lib/auth';
import { storage } from '../lib/database';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const fitnessPlans = await storage.getFitnessPlans();
    return Response.json(fitnessPlans);
  } catch (error) {
    console.error("Error fetching fitness plans:", error);
    return Response.json({ message: "Failed to fetch fitness plans" }, { status: 500 });
  }
});

export { handler as GET };