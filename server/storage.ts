import {
  users,
  userProfiles,
  fitnessPlans,
  planWorkouts,
  workouts,
  workoutSessions,
  exercises,
  achievements,
  userAchievements,
  biometricData,
  activityFeed,
  workoutInbox,
  userFitnessPlans,
  type User,
  type UpsertUser,
  type FitnessPlan,
  type InsertFitnessPlan,
  type PlanWorkout,
  type InsertPlanWorkout,
  type Workout,
  type WorkoutSession,
  type UserProfile,
  type Achievement,
  type BiometricData,
  type WorkoutInbox,
  type Exercise,
  type InsertExercise,
  type InsertWorkout,
  type InsertWorkoutSession,
  type InsertUserProfile,
  type InsertWorkoutInbox,
  type UserFitnessPlan,
  type InsertUserFitnessPlan,
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
  
  // Fitness Plan operations (top level of hierarchy)
  getFitnessPlans(limit?: number): Promise<FitnessPlan[]>;
  getFitnessPlanById(id: string): Promise<FitnessPlan | undefined>;
  getFitnessPlanWithWorkouts(id: string): Promise<any>;
  createFitnessPlan(plan: InsertFitnessPlan): Promise<FitnessPlan>;
  addWorkoutToPlan(planWorkout: InsertPlanWorkout): Promise<PlanWorkout>;
  
  // User Fitness Plan operations (user progress tracking)
  getUserFitnessPlans(userId: string): Promise<UserFitnessPlan[]>;
  getUserFitnessPlanById(id: string): Promise<UserFitnessPlan | undefined>;
  startFitnessPlan(userPlan: InsertUserFitnessPlan): Promise<UserFitnessPlan>;
  updateUserFitnessPlan(id: string, data: Partial<UserFitnessPlan>): Promise<UserFitnessPlan>;
  getUserPlanProgress(userId: string, planId: string): Promise<any>;
  getUserActivePlans(userId: string): Promise<any[]>;
  
  // Workout operations (middle level of hierarchy)
  getWorkouts(limit?: number): Promise<Workout[]>;
  getWorkoutById(id: string): Promise<Workout | undefined>;
  getWorkoutWithExercises(id: string): Promise<any>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  addExerciseToWorkout(exercise: InsertExercise): Promise<Exercise>;
  
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

  // Fitness Plan operations (top level of hierarchy)
  async getFitnessPlans(limit = 20): Promise<FitnessPlan[]> {
    return await db
      .select()
      .from(fitnessPlans)
      .orderBy(desc(fitnessPlans.createdAt))
      .limit(limit);
  }

  async getFitnessPlanById(id: string): Promise<FitnessPlan | undefined> {
    const [plan] = await db.select().from(fitnessPlans).where(eq(fitnessPlans.id, id));
    return plan;
  }

  async getFitnessPlanWithWorkouts(id: string): Promise<any> {
    const plan = await db.query.fitnessPlans.findFirst({
      where: eq(fitnessPlans.id, id),
      with: {
        planWorkouts: {
          with: {
            workout: {
              with: {
                exercises: true,
              }
            }
          },
          orderBy: [planWorkouts.week, planWorkouts.day, planWorkouts.order],
        }
      }
    });
    return plan;
  }

  async createFitnessPlan(plan: InsertFitnessPlan): Promise<FitnessPlan> {
    const [newPlan] = await db.insert(fitnessPlans).values(plan).returning();
    return newPlan;
  }

  async addWorkoutToPlan(planWorkout: InsertPlanWorkout): Promise<PlanWorkout> {
    const [newPlanWorkout] = await db.insert(planWorkouts).values(planWorkout).returning();
    return newPlanWorkout;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db.insert(workouts).values(workout).returning();
    return newWorkout;
  }

  async getWorkoutWithExercises(id: string): Promise<any> {
    const workout = await db.query.workouts.findFirst({
      where: eq(workouts.id, id),
      with: {
        exercises: {
          orderBy: exercises.order,
        }
      }
    });
    return workout;
  }

  async addExerciseToWorkout(exercise: InsertExercise): Promise<Exercise> {
    const [newExercise] = await db.insert(exercises).values(exercise).returning();
    return newExercise;
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

  // User Fitness Plan operations
  async getUserFitnessPlans(userId: string): Promise<UserFitnessPlan[]> {
    return await db
      .select()
      .from(userFitnessPlans)
      .where(eq(userFitnessPlans.userId, userId))
      .orderBy(desc(userFitnessPlans.createdAt));
  }

  async getUserFitnessPlanById(id: string): Promise<UserFitnessPlan | undefined> {
    const [plan] = await db
      .select()
      .from(userFitnessPlans)
      .where(eq(userFitnessPlans.id, id))
      .limit(1);
    
    return plan;
  }

  async startFitnessPlan(userPlan: InsertUserFitnessPlan): Promise<UserFitnessPlan> {
    // First, get the total number of workouts in the plan
    const [planWorkoutCount] = await db
      .select({ count: count() })
      .from(planWorkouts)
      .where(eq(planWorkouts.planId, userPlan.planId!));

    const [created] = await db
      .insert(userFitnessPlans)
      .values({
        ...userPlan,
        totalWorkoutsInPlan: planWorkoutCount.count || 0,
      })
      .returning();

    return created;
  }

  async updateUserFitnessPlan(id: string, data: Partial<UserFitnessPlan>): Promise<UserFitnessPlan> {
    const [updated] = await db
      .update(userFitnessPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userFitnessPlans.id, id))
      .returning();

    return updated;
  }

  async getUserPlanProgress(userId: string, planId: string): Promise<any> {
    const [userPlan] = await db
      .select({
        userPlan: userFitnessPlans,
        plan: fitnessPlans,
      })
      .from(userFitnessPlans)
      .innerJoin(fitnessPlans, eq(userFitnessPlans.planId, fitnessPlans.id))
      .where(and(
        eq(userFitnessPlans.userId, userId),
        eq(userFitnessPlans.planId, planId)
      ))
      .limit(1);

    if (!userPlan) {
      return null;
    }

    // Get completed workout sessions for this plan
    const completedSessions = await db
      .select({
        session: workoutSessions,
        workout: workouts,
      })
      .from(workoutSessions)
      .innerJoin(workouts, eq(workoutSessions.workoutId, workouts.id))
      .where(and(
        eq(workoutSessions.userId, userId),
        eq(workoutSessions.userPlanId, userPlan.userPlan.id),
        eq(workoutSessions.status, 'completed')
      ))
      .orderBy(desc(workoutSessions.completedAt));

    // Get plan workouts structure
    const planStructure = await db
      .select({
        planWorkout: planWorkouts,
        workout: workouts,
      })
      .from(planWorkouts)
      .innerJoin(workouts, eq(planWorkouts.workoutId, workouts.id))
      .where(eq(planWorkouts.planId, planId))
      .orderBy(planWorkouts.week, planWorkouts.day, planWorkouts.order);

    return {
      userPlan: userPlan.userPlan,
      plan: userPlan.plan,
      completedSessions,
      planStructure,
      progressStats: {
        totalWorkouts: userPlan.userPlan.totalWorkoutsInPlan,
        completedWorkouts: userPlan.userPlan.totalWorkoutsCompleted,
        completionPercentage: userPlan.userPlan.completionPercentage,
        currentWeek: userPlan.userPlan.currentWeek,
        status: userPlan.userPlan.status,
      }
    };
  }

  async getUserActivePlans(userId: string): Promise<any[]> {
    const activePlans = await db
      .select({
        userPlan: userFitnessPlans,
        plan: fitnessPlans,
      })
      .from(userFitnessPlans)
      .innerJoin(fitnessPlans, eq(userFitnessPlans.planId, fitnessPlans.id))
      .where(and(
        eq(userFitnessPlans.userId, userId),
        eq(userFitnessPlans.status, 'active')
      ))
      .orderBy(desc(userFitnessPlans.updatedAt));

    return activePlans;
  }
}

export const storage = new DatabaseStorage();
