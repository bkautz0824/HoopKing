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
              heartRateData: [148, 152, 155, 160, 158],
              steps: 2450,
              duration: 45
            },
            autoDetectedType: 'Workout',
            confidence: '0.82',
            title: 'Activity from Apple Watch',
            duration: 45,
            caloriesBurned: 320,
            averageHeartRate: 152,
            aiSummary: 'Detected elevated heart rate for extended period. Possibly basketball or cardio training.',
          },
          {
            userId,
            workoutData: {
              heartRateData: [140, 145, 150, 148],
              steps: 1200,
              duration: 30
            },
            autoDetectedType: 'Workout',
            confidence: '0.75',
            title: 'Workout from Garmin',
            duration: 30,
            caloriesBurned: 250,
            averageHeartRate: 145,
            aiSummary: 'Consistent elevated heart rate with lower step count. Likely strength or skills training.',
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
      
      // Create a workout session entry
      await storage.createWorkoutSession({
        userId,
        // workoutId: manual entries don't need a template
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

  const httpServer = createServer(app);
  return httpServer;
}
