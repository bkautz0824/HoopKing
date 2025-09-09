import {
  users,
  userProfiles,
  workouts,
  workoutSessions,
  exercises,
  achievements,
  userAchievements,
  biometricData,
  activityFeed,
  workoutInbox,
  type User,
  type UpsertUser,
  type Workout,
  type WorkoutSession,
  type UserProfile,
  type Achievement,
  type BiometricData,
  type WorkoutInbox,
  type InsertWorkout,
  type InsertWorkoutSession,
  type InsertUserProfile,
  type InsertWorkoutInbox,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  updateUserProfile(userId: string, data: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Workout operations
  getWorkouts(limit?: number): Promise<Workout[]>;
  getWorkoutById(id: string): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  
  // Session operations
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;
  updateWorkoutSession(sessionId: string, data: Partial<WorkoutSession>): Promise<WorkoutSession>;
  getUserWorkoutSessions(userId: string, limit?: number): Promise<WorkoutSession[]>;
  
  // Achievement operations
  getUserAchievements(userId: string): Promise<Achievement[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<void>;
  
  // Analytics operations
  getUserStats(userId: string): Promise<{
    totalWorkouts: number;
    currentStreak: number;
    totalPoints: number;
    averageHeartRate: number;
    recoveryScore: number;
  }>;
  
  // Leaderboard operations
  getLeaderboard(limit?: number): Promise<Array<{
    user: User;
    profile: UserProfile;
    rank: number;
  }>>;
  
  // Activity feed
  getActivityFeed(userId: string, limit?: number): Promise<any[]>;
  createActivity(userId: string, activity: {
    activityType: string;
    title: string;
    description?: string;
    points?: number;
    metadata?: any;
  }): Promise<void>;
  
  // Workout inbox operations
  getWorkoutInboxItems(userId: string): Promise<WorkoutInbox[]>;
  createWorkoutInboxItem(item: InsertWorkoutInbox): Promise<WorkoutInbox>;
  categorizeWorkoutInboxItem(itemId: string, userId: string, category: string): Promise<WorkoutInbox>;
  ignoreWorkoutInboxItem(itemId: string, userId: string): Promise<WorkoutInbox>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Create user profile if it doesn't exist
    await db
      .insert(userProfiles)
      .values({
        userId: user.id,
        experience: 'beginner',
        totalWorkouts: 0,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        skillLevel: 1,
        recoveryScore: sql`75.0`,
      })
      .onConflictDoNothing();
    
    return user;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async updateUserProfile(userId: string, data: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }

  async getWorkouts(limit = 20): Promise<Workout[]> {
    return await db
      .select()
      .from(workouts)
      .orderBy(desc(workouts.createdAt))
      .limit(limit);
  }

  async getWorkoutById(id: string): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db.insert(workouts).values(workout).returning();
    return newWorkout;
  }

  async createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession> {
    const [newSession] = await db.insert(workoutSessions).values(session).returning();
    return newSession;
  }

  async updateWorkoutSession(sessionId: string, data: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const [session] = await db
      .update(workoutSessions)
      .set(data)
      .where(eq(workoutSessions.id, sessionId))
      .returning();
    return session;
  }

  async getUserWorkoutSessions(userId: string, limit = 10): Promise<WorkoutSession[]> {
    return await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.startedAt))
      .limit(limit);
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const result = await db
      .select({
        achievement: achievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));
    
    return result.map(r => r.achievement);
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    await db.insert(userAchievements).values({
      userId,
      achievementId,
    }).onConflictDoNothing();
  }

  async getUserStats(userId: string): Promise<{
    totalWorkouts: number;
    currentStreak: number;
    totalPoints: number;
    averageHeartRate: number;
    recoveryScore: number;
  }> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    
    // Get average heart rate from recent sessions
    const [heartRateResult] = await db
      .select({
        avgHeartRate: sql<number>`AVG(${workoutSessions.averageHeartRate})`,
      })
      .from(workoutSessions)
      .where(and(
        eq(workoutSessions.userId, userId),
        sql`${workoutSessions.averageHeartRate} IS NOT NULL`
      ));

    return {
      totalWorkouts: profile?.totalWorkouts || 0,
      currentStreak: profile?.currentStreak || 0,
      totalPoints: profile?.totalPoints || 0,
      averageHeartRate: Math.round(heartRateResult?.avgHeartRate || 0),
      recoveryScore: parseFloat(profile?.recoveryScore?.toString() || '0'),
    };
  }

  async getLeaderboard(limit = 10): Promise<Array<{
    user: User;
    profile: UserProfile;
    rank: number;
  }>> {
    const results = await db
      .select({
        user: users,
        profile: userProfiles,
      })
      .from(userProfiles)
      .innerJoin(users, eq(userProfiles.userId, users.id))
      .orderBy(desc(userProfiles.totalPoints))
      .limit(limit);

    return results.map((result, index) => ({
      user: result.user,
      profile: result.profile,
      rank: index + 1,
    }));
  }

  async getActivityFeed(userId: string, limit = 20): Promise<any[]> {
    // Get activities from user and their friends
    return await db
      .select({
        id: activityFeed.id,
        user: users,
        activityType: activityFeed.activityType,
        title: activityFeed.title,
        description: activityFeed.description,
        points: activityFeed.points,
        createdAt: activityFeed.createdAt,
        metadata: activityFeed.metadata,
      })
      .from(activityFeed)
      .innerJoin(users, eq(activityFeed.userId, users.id))
      .where(eq(activityFeed.isPublic, true))
      .orderBy(desc(activityFeed.createdAt))
      .limit(limit);
  }

  async createActivity(userId: string, activity: {
    activityType: string;
    title: string;
    description?: string;
    points?: number;
    metadata?: any;
  }): Promise<void> {
    await db.insert(activityFeed).values({
      userId,
      ...activity,
    });
  }

  // Workout inbox operations
  async getWorkoutInboxItems(userId: string): Promise<WorkoutInbox[]> {
    const items = await db
      .select()
      .from(workoutInbox)
      .where(eq(workoutInbox.userId, userId))
      .orderBy(desc(workoutInbox.receivedAt));
    
    return items;
  }

  async createWorkoutInboxItem(item: InsertWorkoutInbox): Promise<WorkoutInbox> {
    const [created] = await db
      .insert(workoutInbox)
      .values(item)
      .returning();
    
    return created;
  }

  async categorizeWorkoutInboxItem(itemId: string, userId: string, category: string): Promise<WorkoutInbox> {
    const [updated] = await db
      .update(workoutInbox)
      .set({
        status: 'categorized',
        category,
        processedAt: new Date(),
      })
      .where(and(eq(workoutInbox.id, itemId), eq(workoutInbox.userId, userId)))
      .returning();
    
    return updated;
  }

  async ignoreWorkoutInboxItem(itemId: string, userId: string): Promise<WorkoutInbox> {
    const [updated] = await db
      .update(workoutInbox)
      .set({
        status: 'ignored',
        processedAt: new Date(),
      })
      .where(and(eq(workoutInbox.id, itemId), eq(workoutInbox.userId, userId)))
      .returning();
    
    return updated;
  }
}

export const storage = new DatabaseStorage();
