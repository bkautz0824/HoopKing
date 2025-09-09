import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiTrainerService } from "./services/aiTrainer";
import { insertWorkoutSessionSchema, insertUserProfileSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const profile = await storage.getUserProfile(userId);
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard data
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [stats, achievements, leaderboard, activityFeed] = await Promise.all([
        storage.getUserStats(userId),
        storage.getUserAchievements(userId),
        storage.getLeaderboard(10),
        storage.getActivityFeed(userId, 10),
      ]);

      res.json({
        stats,
        achievements,
        leaderboard,
        activityFeed,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Workouts
  app.get('/api/workouts', isAuthenticated, async (req: any, res) => {
    try {
      const workouts = await storage.getWorkouts(20);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get('/api/workouts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const workout = await storage.getWorkoutById(req.params.id);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      console.error("Error fetching workout:", error);
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  // AI-generated workouts
  app.post('/api/ai/generate-workout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      const stats = await storage.getUserStats(userId);
      
      const workout = await aiTrainerService.generatePersonalizedWorkout({
        userProfile: profile,
        userStats: stats,
        preferences: req.body.preferences || {},
      });

      res.json(workout);
    } catch (error) {
      console.error("Error generating AI workout:", error);
      res.status(500).json({ message: "Failed to generate AI workout" });
    }
  });

  app.post('/api/ai/workout-insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserWorkoutSessions(userId, 5);
      const profile = await storage.getUserProfile(userId);
      
      const insights = await aiTrainerService.generateInsights({
        recentSessions: sessions,
        userProfile: profile,
      });

      res.json(insights);
    } catch (error) {
      console.error("Error generating workout insights:", error);
      res.status(500).json({ message: "Failed to generate workout insights" });
    }
  });

  // Workout sessions
  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertWorkoutSessionSchema.parse({
        ...req.body,
        userId,
      });

      const session = await storage.createWorkoutSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.patch('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = req.params.id;
      
      // Verify session belongs to user
      const sessions = await storage.getUserWorkoutSessions(userId);
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const updatedSession = await storage.updateWorkoutSession(sessionId, req.body);
      
      // Update user stats if session was completed
      if (req.body.status === 'completed' && req.body.completedAt) {
        const profile = await storage.getUserProfile(userId);
        if (profile) {
          await storage.updateUserProfile(userId, {
            totalWorkouts: (profile.totalWorkouts || 0) + 1,
            currentStreak: (profile.currentStreak || 0) + 1,
            totalPoints: (profile.totalPoints || 0) + 50, // Base points for completion
          });

          // Create activity
          await storage.createActivity(userId, {
            activityType: 'workout_completed',
            title: 'Completed workout',
            description: `Finished a ${updatedSession.totalDuration || 0} minute workout`,
            points: 50,
          });
        }
      }

      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // User profile
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertUserProfileSchema.partial().parse(req.body);
      
      const updatedProfile = await storage.updateUserProfile(userId, profileData);
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Workout inbox routes
  app.get('/api/workout-inbox', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      
      res.json(inboxItems);
    } catch (error) {
      console.error("Error fetching workout inbox:", error);
      res.status(500).json({ message: "Failed to fetch workout inbox" });
    }
  });

  app.post('/api/workout-inbox/:id/categorize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = req.params.id;
      const { category } = req.body;
      
      const updatedItem = await storage.categorizeWorkoutInboxItem(itemId, userId, category);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error categorizing workout:", error);
      res.status(500).json({ message: "Failed to categorize workout" });
    }
  });

  app.post('/api/workout-inbox/:id/ignore', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = req.params.id;
      
      const updatedItem = await storage.ignoreWorkoutInboxItem(itemId, userId);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error ignoring workout:", error);
      res.status(500).json({ message: "Failed to ignore workout" });
    }
  });

  // AI workout message processing
  app.post('/api/ai/process-workout-message', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;
      
      // Simple pattern matching for workout detection
      const workoutPatterns = {
        basketball: /basketball|ball|court|dribbl|shoot/i,
        cardio: /cardio|run|jog|sprint/i,
        strength: /strength|weight|lift|gym/i,
      };
      
      // Extract duration from message
      const durationMatch = message.match(/(\d+)\s*(min|minute|hour)/i);
      const duration = durationMatch ? parseInt(durationMatch[1]) : 30;
      
      let workoutType = 'general';
      let category = 'other';
      
      if (workoutPatterns.basketball.test(message)) {
        workoutType = 'basketball training';
        category = 'basketball_training';
      } else if (workoutPatterns.cardio.test(message)) {
        workoutType = 'cardio session';
        category = 'cardio';
      } else if (workoutPatterns.strength.test(message)) {
        workoutType = 'strength training';
        category = 'strength';
      }
      
      // Create a workout session entry (for manual/AI entries, we'll use a default workoutId)
      await storage.createWorkoutSession({
        userId,
        workoutId: 'manual-entry', // placeholder for manual entries
        status: 'completed',
        totalDuration: duration * 60, // convert to seconds
        caloriesBurned: Math.floor(duration * 8), // rough estimate
        notes: `AI logged: ${message}`,
      });
      
      const response = `Great! I've logged your ${duration}-minute ${workoutType}. Keep up the excellent work!`;
      
      res.json({ 
        response,
        workoutCreated: true,
        category,
        duration
      });
    } catch (error) {
      console.error("Error processing workout message:", error);
      res.status(500).json({ message: "Failed to process workout message" });
    }
  });

  // Mock biometric data endpoint (for wearable integration demo)
  app.get('/api/biometrics/live', isAuthenticated, async (req: any, res) => {
    // Mock real-time biometric data
    const mockData = {
      heartRate: Math.floor(Math.random() * (180 - 60) + 60),
      steps: Math.floor(Math.random() * 5000 + 2000),
      calories: Math.floor(Math.random() * 500 + 200),
      hrv: Math.floor(Math.random() * 50 + 30),
      timestamp: new Date().toISOString(),
    };
    
    res.json(mockData);
  });

  // AI fitness plan generation
  app.post('/api/ai/generate-fitness-plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      const stats = await storage.getUserStats(userId);
      
      const generatedPlan = await aiTrainerService.generateFitnessPlan({
        userProfile: profile,
        userStats: stats,
        preferences: req.body.preferences || {},
      });

      // Map methodology to valid planType enum values
      const methodologyToPlanType = (methodology: string) => {
        const methodologyLower = methodology.toLowerCase();
        switch (methodologyLower) {
          case 'goata':
            return 'mixed';
          case 'soviet':
            return 'strength';
          case 'nba':
            return 'basketball';
          case 'hypertrophy':
            return 'strength';
          default:
            return 'mixed';
        }
      };

      // Save the generated plan to the database
      const planToSave = {
        name: generatedPlan.name,
        description: generatedPlan.description,
        methodology: generatedPlan.methodology,
        planType: methodologyToPlanType(generatedPlan.methodology || 'mixed') as any,
        difficulty: generatedPlan.difficulty,
        duration: generatedPlan.duration,
        workoutsPerWeek: generatedPlan.workoutsPerWeek,
        aiGenerated: true,
        isPopular: false,
        createdBy: userId,
      };

      const savedPlan = await storage.createFitnessPlan(planToSave);
      
      // Return the saved plan with its database ID
      res.json({
        ...generatedPlan,
        id: savedPlan.id,
        createdBy: savedPlan.createdBy,
        createdAt: savedPlan.createdAt,
      });
    } catch (error) {
      console.error("Error generating AI fitness plan:", error);
      res.status(500).json({ message: "Failed to generate AI fitness plan" });
    }
  });

  // User Fitness Plan Progress Endpoints
  app.post('/api/user-plans/start', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id as string;
      const { planId } = req.body;

      // Check if user already has an active plan with this ID
      const existingPlans = await storage.getUserFitnessPlans(userId);
      const existingActivePlan = existingPlans.find(
        p => p.planId === planId && p.status === 'active'
      );

      if (existingActivePlan) {
        return res.status(400).json({ message: "You already have an active plan with this ID" });
      }

      const userPlan = await storage.startFitnessPlan({
        userId,
        planId,
        status: 'active',
      });

      res.json(userPlan);
    } catch (error) {
      console.error("Error starting fitness plan:", error);
      res.status(500).json({ message: "Failed to start fitness plan" });
    }
  });

  app.get('/api/user-plans', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id as string;
      const userPlans = await storage.getUserActivePlans(userId);
      res.json(userPlans);
    } catch (error) {
      console.error("Error fetching user plans:", error);
      res.status(500).json({ message: "Failed to fetch user plans" });
    }
  });

  app.get('/api/user-plans/:planId/progress', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id as string;
      const { planId } = req.params;
      
      const progress = await storage.getUserPlanProgress(userId, planId);
      if (!progress) {
        return res.status(404).json({ message: "Plan progress not found" });
      }

      res.json(progress);
    } catch (error) {
      console.error("Error fetching plan progress:", error);
      res.status(500).json({ message: "Failed to fetch plan progress" });
    }
  });

  app.put('/api/user-plans/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedPlan = await storage.updateUserFitnessPlan(id, updateData);
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating user plan:", error);
      res.status(500).json({ message: "Failed to update user plan" });
    }
  });

  // Fitness Plans CRUD
  app.get('/api/fitness-plans', isAuthenticated, async (req, res) => {
    try {
      const plans = await storage.getFitnessPlans(20);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching fitness plans:", error);
      res.status(500).json({ message: "Failed to fetch fitness plans" });
    }
  });

  app.get('/api/fitness-plans/:id', isAuthenticated, async (req, res) => {
    try {
      const plan = await storage.getFitnessPlanWithWorkouts(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Fitness plan not found" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Error fetching fitness plan:", error);
      res.status(500).json({ message: "Failed to fetch fitness plan" });
    }
  });

  // Seed workout database
  app.post('/api/seed-workouts', isAuthenticated, async (req, res) => {
    try {
      const { seedWorkoutDatabase } = await import('./seed-workouts');
      const seededWorkouts = await seedWorkoutDatabase();
      res.json({ 
        message: `Successfully seeded ${seededWorkouts.length} workouts`,
        workouts: seededWorkouts.length
      });
    } catch (error) {
      console.error("Error seeding workouts:", error);
      res.status(500).json({ message: "Failed to seed workout database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
