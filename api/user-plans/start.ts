import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../../lib/auth';
import { storage } from '../../lib/database';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const userId = user.claims.sub;
    const body = await request.json();
    const { planId } = body;

    // Check if user already has an active plan with this ID
    const existingPlans = await storage.getUserFitnessPlans(userId);
    const existingActivePlan = existingPlans.find(
      p => p.planId === planId && p.status === 'active'
    );

    if (existingActivePlan) {
      return Response.json({ message: "You already have an active plan with this ID" }, { status: 400 });
    }

    const userPlan = await storage.startFitnessPlan({
      userId,
      planId,
      status: 'active',
    });

    return Response.json(userPlan);
  } catch (error) {
    console.error("Error starting fitness plan:", error);
    return Response.json({ message: "Failed to start fitness plan" }, { status: 500 });
  }
});

export { handler as POST };