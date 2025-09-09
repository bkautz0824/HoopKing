import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Basketball training specific enums
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced', 'pro']);
export const workoutTypeEnum = pgEnum('workout_type', ['strength', 'cardio', 'skills', 'recovery', 'mixed']);
export const deviceTypeEnum = pgEnum('device_type', ['apple_watch', 'garmin', 'coros', 'fitbit']);
export const planTypeEnum = pgEnum('plan_type', ['strength', 'basketball', 'conditioning', 'skills', 'recovery', 'mixed']);

// Fitness Plans (GOATA, Soviet training, NBA-specific, etc.)
export const fitnessPlans = pgTable("fitness_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  methodology: varchar("methodology", { length: 100 }), // 'GOATA', 'Soviet', 'NBA', 'Hypertrophy', etc.
  planType: planTypeEnum("plan_type").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  duration: integer("duration"), // total plan duration in weeks
  workoutsPerWeek: integer("workouts_per_week"),
  aiGenerated: boolean("ai_generated").default(false),
  isPopular: boolean("is_popular").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout categories
export const workoutCategories = pgTable("workout_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual Workouts (can be standalone or part of a fitness plan)
export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => workoutCategories.id),
  duration: integer("duration"), // in minutes
  difficulty: difficultyEnum("difficulty").notNull(),
  workoutType: workoutTypeEnum("workout_type").notNull(),
  isPopular: boolean("is_popular").default(false),
  aiGenerated: boolean("ai_generated").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Junction table linking workouts to fitness plans with ordering
export const planWorkouts = pgTable("plan_workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").references(() => fitnessPlans.id).notNull(),
  workoutId: varchar("workout_id").references(() => workouts.id).notNull(),
  week: integer("week").notNull(), // which week of the plan
  day: integer("day").notNull(), // which day of the week (1-7)
  order: integer("order").notNull(), // order within the day if multiple workouts
  isOptional: boolean("is_optional").default(false),
  notes: text("notes"), // plan-specific notes for this workout
});

// Exercises within workouts
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").references(() => workouts.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  sets: integer("sets"),
  reps: integer("reps"),
  duration: integer("duration"), // in seconds
  restTime: integer("rest_time"), // in seconds
  order: integer("order").notNull(),
  instructions: text("instructions"),
  tips: text("tips"),
  videoUrl: varchar("video_url"),
});

// User workout sessions
export const workoutSessions = pgTable("workout_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  workoutId: varchar("workout_id").references(() => workouts.id).notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  status: varchar("status", { length: 20 }).notNull(), // 'active', 'completed', 'cancelled'
  totalDuration: integer("total_duration"), // actual duration in seconds
  caloriesBurned: integer("calories_burned"),
  averageHeartRate: integer("average_heart_rate"),
  maxHeartRate: integer("max_heart_rate"),
  notes: text("notes"),
});

// Exercise performance within sessions
export const exercisePerformance = pgTable("exercise_performance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => workoutSessions.id).notNull(),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  setsCompleted: integer("sets_completed"),
  repsCompleted: integer("reps_completed"),
  weight: decimal("weight", { precision: 5, scale: 2 }), // in kg
  duration: integer("duration"), // actual duration in seconds
  restTime: integer("rest_time"), // actual rest time in seconds
  heartRate: integer("heart_rate"),
  rating: integer("rating"), // 1-10 difficulty rating
  notes: text("notes"),
});

// User achievements
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url"),
  category: varchar("category", { length: 50 }), // 'streak', 'skill', 'milestone', 'challenge'
  requirement: jsonb("requirement"), // flexible requirements structure
  points: integer("points").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievement unlocks
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  achievementId: varchar("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: jsonb("progress"), // current progress towards achievement
});

// User profiles with training data
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  age: integer("age"),
  height: integer("height"), // in cm
  weight: decimal("weight", { precision: 5, scale: 2 }), // in kg
  experience: varchar("experience", { length: 20 }), // 'beginner', 'intermediate', 'advanced', 'pro'
  goals: text("goals"),
  preferences: jsonb("preferences"), // training preferences, time slots, etc.
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalWorkouts: integer("total_workouts").default(0),
  totalPoints: integer("total_points").default(0),
  skillLevel: integer("skill_level").default(1),
  recoveryScore: decimal("recovery_score", { precision: 3, scale: 1 }).default(sql`0.0`),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wearable device connections
export const wearableDevices = pgTable("wearable_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  deviceType: deviceTypeEnum("device_type").notNull(),
  deviceName: varchar("device_name", { length: 100 }),
  deviceId: varchar("device_id").unique(),
  isConnected: boolean("is_connected").default(true),
  lastSync: timestamp("last_sync"),
  settings: jsonb("settings"), // device-specific settings
  createdAt: timestamp("created_at").defaultNow(),
});

// Biometric data from wearables
export const biometricData = pgTable("biometric_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  deviceId: varchar("device_id").references(() => wearableDevices.id),
  sessionId: varchar("session_id").references(() => workoutSessions.id),
  timestamp: timestamp("timestamp").defaultNow(),
  heartRate: integer("heart_rate"),
  steps: integer("steps"),
  calories: integer("calories"),
  distance: decimal("distance", { precision: 6, scale: 2 }), // in meters
  hrv: decimal("hrv", { precision: 5, scale: 2 }), // heart rate variability
  sleepScore: decimal("sleep_score", { precision: 3, scale: 1 }),
  stressLevel: integer("stress_level"), // 1-100
  recoveryMetrics: jsonb("recovery_metrics"),
});

// GOATA movement analysis
export const movementAnalysis = pgTable("movement_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sessionId: varchar("session_id").references(() => workoutSessions.id),
  chainIntegration: decimal("chain_integration", { precision: 3, scale: 1 }),
  coreStability: decimal("core_stability", { precision: 3, scale: 1 }),
  hipFunction: decimal("hip_function", { precision: 3, scale: 1 }),
  shoulderStability: decimal("shoulder_stability", { precision: 3, scale: 1 }),
  overallScore: decimal("overall_score", { precision: 3, scale: 1 }),
  recommendations: text("recommendations"),
  analyzedAt: timestamp("analyzed_at").defaultNow(),
});

// AI workout templates
export const aiWorkoutTemplates = pgTable("ai_workout_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  difficulty: difficultyEnum("difficulty").notNull(),
  workoutType: workoutTypeEnum("workout_type").notNull(),
  duration: integer("duration"), // in minutes
  targetMuscles: text("target_muscles").array(),
  equipment: text("equipment").array(),
  template: jsonb("template"), // AI-generated workout structure
  createdAt: timestamp("created_at").defaultNow(),
});

// Social features - friend connections
export const friendConnections = pgTable("friend_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  friendId: varchar("friend_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'pending', 'accepted', 'blocked'
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity feed
export const activityFeed = pgTable("activity_feed", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  metadata: jsonb("metadata"), // flexible data for different activity types
  points: integer("points").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout inbox for wearable data integration
export const workoutInbox = pgTable("workout_inbox", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  deviceId: varchar("device_id").references(() => wearableDevices.id),
  workoutData: jsonb("workout_data").notNull(), // raw workout data from device
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'categorized', 'ignored'
  category: varchar("category", { length: 50 }), // user-assigned category
  workoutSessionId: varchar("workout_session_id").references(() => workoutSessions.id), // linked session if categorized
  autoDetectedType: varchar("auto_detected_type", { length: 50 }), // AI-detected workout type
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // AI confidence score
  title: varchar("title", { length: 200 }).notNull(),
  duration: integer("duration"), // workout duration in minutes
  caloriesBurned: integer("calories_burned"),
  averageHeartRate: integer("average_heart_rate"),
  maxHeartRate: integer("max_heart_rate"),
  aiSummary: text("ai_summary"), // AI-generated workout summary
  receivedAt: timestamp("received_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Relations
export const fitnessPlansRelations = relations(fitnessPlans, ({ one, many }) => ({
  creator: one(users, {
    fields: [fitnessPlans.createdBy],
    references: [users.id],
  }),
  planWorkouts: many(planWorkouts),
}));

export const planWorkoutsRelations = relations(planWorkouts, ({ one }) => ({
  plan: one(fitnessPlans, {
    fields: [planWorkouts.planId],
    references: [fitnessPlans.id],
  }),
  workout: one(workouts, {
    fields: [planWorkouts.workoutId],
    references: [workouts.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles),
  workoutSessions: many(workoutSessions),
  achievements: many(userAchievements),
  wearableDevices: many(wearableDevices),
  biometricData: many(biometricData),
  activities: many(activityFeed),
  workoutInboxItems: many(workoutInbox),
  createdPlans: many(fitnessPlans),
  createdWorkouts: many(workouts),
}));

export const workoutInboxRelations = relations(workoutInbox, ({ one }) => ({
  user: one(users, {
    fields: [workoutInbox.userId],
    references: [users.id],
  }),
  device: one(wearableDevices, {
    fields: [workoutInbox.deviceId],
    references: [wearableDevices.id],
  }),
  workoutSession: one(workoutSessions, {
    fields: [workoutInbox.workoutSessionId],
    references: [workoutSessions.id],
  }),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [workoutSessions.userId],
    references: [users.id],
  }),
  workout: one(workouts, {
    fields: [workoutSessions.workoutId],
    references: [workouts.id],
  }),
  exercisePerformances: many(exercisePerformance),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({
  id: true,
  startedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  updatedAt: true,
});

export const insertWorkoutInboxSchema = createInsertSchema(workoutInbox).omit({
  id: true,
  receivedAt: true,
});

export const insertFitnessPlanSchema = createInsertSchema(fitnessPlans).omit({
  id: true,
  createdAt: true,
});

export const insertPlanWorkoutSchema = createInsertSchema(planWorkouts).omit({
  id: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type FitnessPlan = typeof fitnessPlans.$inferSelect;
export type PlanWorkout = typeof planWorkouts.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type BiometricData = typeof biometricData.$inferSelect;
export type WorkoutInbox = typeof workoutInbox.$inferSelect;
export type InsertFitnessPlan = z.infer<typeof insertFitnessPlanSchema>;
export type InsertPlanWorkout = z.infer<typeof insertPlanWorkoutSchema>;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertWorkoutInbox = z.infer<typeof insertWorkoutInboxSchema>;
