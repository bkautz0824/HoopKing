import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '../lib/auth';
import { storage } from '../lib/database';

const handler = createAuthenticatedHandler(async (request: NextRequest, user: any) => {
  try {
    const userId = user.claims.sub;
    let inboxItems = await storage.getWorkoutInboxItems(userId);
    
    // If no items exist, create some sample data for demonstration
    if (inboxItems.length === 0) {
      const sampleItems = [
        {
          userId,
          workoutData: {
            heartRateData: [78, 142, 165, 158, 171, 159, 88],
            steps: 3420,
            duration: 52
          },
          autoDetectedType: 'Basketball',
          confidence: '0.91',
          title: 'Basketball Training - Apple Watch',
          duration: 52,
          caloriesBurned: 486,
          averageHeartRate: 159,
          aiSummary: 'High-intensity interval pattern with quick direction changes. Typical basketball training session.',
        },
        {
          userId,
          workoutData: {
            heartRateData: [85, 95, 98, 92, 89],
            steps: 890,
            duration: 25
          },
          autoDetectedType: 'Strength Training',
          confidence: '0.87',
          title: 'Gym Session - Garmin',
          duration: 25,
          caloriesBurned: 198,
          averageHeartRate: 92,
          aiSummary: 'Low step count with sustained moderate heart rate. Resistance training detected.',
        },
        {
          userId,
          workoutData: {
            heartRateData: [92, 156, 168, 175, 162, 148, 95],
            steps: 4200,
            duration: 38
          },
          autoDetectedType: 'Cardio',
          confidence: '0.85',
          title: 'Morning Run - Apple Watch',
          duration: 38,
          caloriesBurned: 342,
          averageHeartRate: 157,
          aiSummary: 'Steady elevated heart rate with consistent step pattern. Running workout identified.',
        }
      ];
      
      // Create sample items
      for (const item of sampleItems) {
        await storage.createWorkoutInboxItem(item);
      }
      
      // Fetch the newly created items
      inboxItems = await storage.getWorkoutInboxItems(userId);
    }
    
    return Response.json(inboxItems);
  } catch (error) {
    console.error("Error fetching workout inbox:", error);
    return Response.json({ message: "Failed to fetch workout inbox" }, { status: 500 });
  }
});

export { handler as GET };