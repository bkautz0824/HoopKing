import Anthropic from '@anthropic-ai/sdk';
import type { UserProfile, WorkoutSession } from '@shared/schema';

/*
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
*/

// <important_do_not_delete>
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
// </important_do_not_delete>

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface WorkoutGenerationRequest {
  userProfile?: UserProfile;
  userStats?: any;
  preferences?: {
    duration?: number;
    intensity?: string;
    focusArea?: string;
    equipment?: string[];
  };
}

interface InsightGenerationRequest {
  recentSessions?: WorkoutSession[];
  userProfile?: UserProfile;
}

class AITrainerService {
  async generatePersonalizedWorkout(request: WorkoutGenerationRequest) {
    const { userProfile, userStats, preferences } = request;
    
    const prompt = this.buildWorkoutPrompt(userProfile, userStats, preferences);

    try {
      const response = await anthropic.messages.create({
        // "claude-sonnet-4-20250514"
        model: DEFAULT_MODEL_STR,
        max_tokens: 2000,
        system: `You are an elite basketball training AI coach specializing in personalized workout generation. You understand GOATA movement methodology, basketball-specific training, and how to adapt workouts based on user data, recovery metrics, and performance history.

Your workouts should:
1. Be basketball-specific and functional
2. Consider the user's experience level and recovery status
3. Include proper warm-up, main work, and cool-down phases
4. Incorporate GOATA movement principles when appropriate
5. Be progressive and challenging but safe
6. Include specific coaching cues and form tips

Always respond with a JSON object containing the workout structure.`,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      const workoutData = JSON.parse(response.content[0].text);
      
      return {
        ...workoutData,
        aiGenerated: true,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating AI workout:', error);
      throw new Error('Failed to generate personalized workout');
    }
  }

  async generateInsights(request: InsightGenerationRequest) {
    const { recentSessions, userProfile } = request;
    
    const prompt = this.buildInsightPrompt(recentSessions, userProfile);

    try {
      const response = await anthropic.messages.create({
        // "claude-sonnet-4-20250514"
        model: DEFAULT_MODEL_STR,
        max_tokens: 1500,
        system: `You are an AI basketball training analyst. Analyze user workout data and provide actionable insights about their training patterns, progress, and areas for improvement. Focus on:

1. Performance trends and patterns
2. Recovery recommendations
3. Skill development priorities
4. Training load optimization
5. Motivation and goal-setting advice

Be encouraging but realistic, and always provide specific, actionable recommendations.`,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      const insightData = JSON.parse(response.content[0].text);
      
      return {
        ...insightData,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating insights:', error);
      throw new Error('Failed to generate workout insights');
    }
  }

  private buildWorkoutPrompt(userProfile?: UserProfile, userStats?: any, preferences?: any): string {
    return `Generate a personalized basketball workout based on the following user data:

User Profile:
- Experience Level: ${userProfile?.experience || 'intermediate'}
- Age: ${userProfile?.age || 'not specified'}
- Current Streak: ${userProfile?.currentStreak || 0} days
- Total Workouts: ${userProfile?.totalWorkouts || 0}
- Skill Level: ${userProfile?.skillLevel || 1}
- Recovery Score: ${userProfile?.recoveryScore || 75}%

Current Stats:
- Total Points: ${userStats?.totalPoints || 0}
- Average Heart Rate: ${userStats?.averageHeartRate || 'not available'} BPM
- Recovery Score: ${userStats?.recoveryScore || 75}%

Workout Preferences:
- Desired Duration: ${preferences?.duration || 45} minutes
- Intensity Level: ${preferences?.intensity || 'moderate'}
- Focus Area: ${preferences?.focusArea || 'overall skills'}
- Available Equipment: ${preferences?.equipment?.join(', ') || 'basketball, cones, ladder'}

Please generate a detailed workout plan in the following JSON format:
{
  "name": "Workout Name",
  "description": "Brief description of the workout",
  "duration": 45,
  "difficulty": "intermediate",
  "workoutType": "skills",
  "intensityLevel": 8,
  "expectedHRZone": "Zone 4-5",
  "phases": [
    {
      "name": "Dynamic Warm-up",
      "duration": 8,
      "description": "GOATA movement prep",
      "exercises": [
        {
          "name": "Exercise name",
          "duration": 2,
          "instructions": "Detailed instructions",
          "tips": "Coaching tips"
        }
      ]
    }
  ],
  "coachingNotes": "Overall coaching advice and tips",
  "goataFocus": "Specific GOATA methodology focus areas"
}`;
  }

  private buildInsightPrompt(recentSessions?: WorkoutSession[], userProfile?: UserProfile): string {
    const sessionsData = recentSessions?.map(session => ({
      completedAt: session.completedAt,
      duration: session.totalDuration,
      status: session.status,
      heartRate: session.averageHeartRate,
      calories: session.caloriesBurned,
    })) || [];

    return `Analyze this user's recent basketball training data and provide personalized insights:

User Profile:
- Experience: ${userProfile?.experience || 'intermediate'}
- Current Streak: ${userProfile?.currentStreak || 0} days
- Total Workouts: ${userProfile?.totalWorkouts || 0}
- Skill Level: ${userProfile?.skillLevel || 1}
- Recovery Score: ${userProfile?.recoveryScore || 75}%

Recent Workout Sessions:
${JSON.stringify(sessionsData, null, 2)}

Please provide insights in the following JSON format:
{
  "overallProgress": "Assessment of overall progress",
  "trainingConsistency": "Analysis of training consistency",
  "performanceTrends": [
    {
      "metric": "Heart Rate",
      "trend": "improving",
      "insight": "Detailed insight about this metric"
    }
  ],
  "recommendations": [
    {
      "category": "Training",
      "priority": "high",
      "recommendation": "Specific actionable advice"
    }
  ],
  "nextWeekFocus": "What to focus on in the coming week",
  "motivationalNote": "Encouraging message based on their progress"
}`;
  }
}

export const aiTrainerService = new AITrainerService();
