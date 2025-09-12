import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Mock data for demo
const mockData: Record<string, any> = {
  "/api/auth/user": {
    id: "demo-user-123",
    email: "demo@hoopking.app",
    firstName: "Demo",
    lastName: "Player",
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  "/api/dashboard": {
    stats: {
      totalWorkouts: 47,
      currentStreak: 8,
      totalMinutes: 2840,
      avgHeartRate: 142
    },
    achievements: [
      { id: 1, name: "First Week", description: "Complete 7 workouts", completed: true },
      { id: 2, name: "Consistency King", description: "30 day streak", completed: false, progress: 8 }
    ],
    leaderboard: [
      { 
        rank: 1, 
        user: { 
          id: "demo-user-123", 
          firstName: "Demo", 
          lastName: "Player", 
          email: "demo@hoopking.app", 
          profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
        }, 
        profile: { totalPoints: 1250 } 
      },
      { 
        rank: 2, 
        user: { 
          id: "john-doe", 
          firstName: "John", 
          lastName: "Doe", 
          email: "john@example.com", 
          profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" 
        }, 
        profile: { totalPoints: 1180 } 
      },
      { 
        rank: 3, 
        user: { 
          id: "jane-smith", 
          firstName: "Jane", 
          lastName: "Smith", 
          email: "jane@example.com", 
          profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" 
        }, 
        profile: { totalPoints: 1050 } 
      }
    ],
    activityFeed: [
      { 
        id: 1, 
        activityType: "workout_completed", 
        title: "completed NBA Conditioning workout", 
        points: 150,
        createdAt: new Date(),
        user: { 
          id: "demo-user-123", 
          firstName: "Demo", 
          email: "demo@hoopking.app" 
        }
      },
      { 
        id: 2, 
        activityType: "achievement_unlocked", 
        title: "unlocked 'Consistency King' achievement", 
        points: 200,
        createdAt: new Date(),
        user: { 
          id: "demo-user-123", 
          firstName: "Demo", 
          email: "demo@hoopking.app" 
        }
      }
    ]
  },
  "/api/workouts": [
    {
      id: "1",
      name: "NBA Conditioning Circuit",
      description: "High-intensity basketball conditioning",
      difficulty: "advanced",
      duration: 45,
      type: "conditioning",
      exercises: [
        { name: "Suicides", sets: 3, reps: 5, duration: 30 },
        { name: "Jump Shots", sets: 5, reps: 10 },
        { name: "Defensive Slides", sets: 3, duration: 60 }
      ]
    },
    {
      id: "2", 
      name: "Ball Handling Mastery",
      description: "Advanced dribbling and ball control",
      difficulty: "intermediate",
      duration: 30,
      type: "skills"
    }
  ],
  "/api/fitness-plans": [
    {
      id: "1",
      name: "GOATA Movement System",
      description: "Revolutionary movement training",
      type: "strength",
      methodology: "GOATA",
      difficulty: "advanced",
      duration: 12, // weeks
      workoutsPerWeek: 4
    },
    {
      id: "2",
      name: "Soviet Training Protocol",
      description: "High-intensity strength building",
      type: "strength",
      methodology: "Soviet",
      difficulty: "pro",
      duration: 16,
      workoutsPerWeek: 5
    }
  ],
  "/api/user-plans": [
    {
      userPlan: {
        id: "up1",
        status: "active",
        currentWeek: 3,
        totalWorkoutsCompleted: 12,
        totalWorkoutsInPlan: 48,
        completionPercentage: "25",
        lastWorkoutDate: "2024-09-10",
        startDate: "2024-01-01"
      },
      plan: {
        id: "1",
        name: "GOATA Movement System",
        description: "Revolutionary movement training",
        methodology: "GOATA",
        duration: 12,
        workoutsPerWeek: 4
      }
    }
  ],
  "/api/workout-inbox": [
    {
      id: "inbox1",
      title: "Basketball Training - Apple Watch",
      autoDetectedType: "Basketball",
      confidence: "0.91",
      duration: 52,
      caloriesBurned: 486,
      averageHeartRate: 159,
      aiSummary: "High-intensity interval pattern with quick direction changes. Typical basketball training session.",
      workoutData: {
        heartRateData: [78, 142, 165, 158, 171, 159, 88],
        steps: 3420,
        duration: 52
      }
    }
  ]
};

// Demo query function that returns mock data
export const getDemoQueryFn: <T>() => QueryFunction<T> = () => 
  async ({ queryKey }) => {
    const key = queryKey.join("/");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (mockData[key]) {
      return mockData[key];
    }
    
    // Return empty data for unknown endpoints
    console.log(`Mock data not found for: ${key}`);
    return null;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getDemoQueryFn(),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Mock API request for mutations
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`Demo API Request: ${method} ${url}`, data);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return success response
  return new Response(JSON.stringify({ success: true, message: "Demo mode - no actual API call" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}