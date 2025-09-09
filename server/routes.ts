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
              type: 'basketball_training',
              exercises: ['dribbling', 'shooting', 'conditioning'],
              intensity: 'high'
            },
            autoDetectedType: 'Basketball Training',
            confidence: 0.92,
            title: 'Morning Basketball Practice',
            duration: 45,
            caloriesBurned: 420,
            averageHeartRate: 152,
            maxHeartRate: 178,
            aiSummary: 'High-intensity basketball training session focusing on ball handling and shooting fundamentals with excellent form consistency.',
          },
          {
            userId,
            workoutData: {
              type: 'cardio',
              exercises: ['running', 'interval_training'],
              intensity: 'moderate'
            },
            autoDetectedType: 'Cardio Training',
            confidence: 0.88,
            title: 'Court Sprint Intervals',
            duration: 30,
            caloriesBurned: 350,
            averageHeartRate: 145,
            maxHeartRate: 168,
            aiSummary: 'Moderate cardio session with interval training patterns. Good progression in speed and endurance metrics.',
          },
          {
            userId,
            workoutData: {
              type: 'strength',
              exercises: ['squats', 'deadlifts', 'core'],
              intensity: 'high'
            },
            autoDetectedType: 'Strength Training',
            confidence: 0.75,
            title: 'Lower Body Strength',
            duration: 35,
            caloriesBurned: 280,
            averageHeartRate: 135,
            maxHeartRate: 155,
            aiSummary: 'Focused strength training targeting legs and core. Heart rate patterns suggest good power output during compound movements.',
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
