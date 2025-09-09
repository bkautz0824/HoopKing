import { db } from "./db";
import { workouts } from "../shared/schema";

const seedWorkouts = [
  // GOATA Movement Workouts
  {
    name: "GOATA Foundation Flow",
    description: "Core GOATA movement patterns focusing on spiral alignment and myofascial release",
    category: "recovery",
    methodology: "goata",
    difficulty: "beginner" as const,
    duration: 45,
    equipment: ["none"],
    targetMuscles: ["core", "glutes", "posterior chain"],
    instructions: "Focus on spiral movement patterns and maintaining alignment through the kinetic chain",
    exercises: [
      { name: "Walking Backwards", reps: "2 minutes", notes: "Heel to toe, focus on posterior chain activation" },
      { name: "Forward Fold Flow", reps: "10 reps", notes: "Spiral down through the chain" },
      { name: "Glute Spiral Activation", reps: "15 each side", notes: "Feel the spiral through the hip" },
      { name: "Single Leg Balance", reps: "30 seconds each", notes: "Maintain spiral alignment" }
    ]
  },
  {
    name: "GOATA Athletic Power",
    description: "Advanced GOATA patterns for explosive power development and athletic performance",
    category: "strength",
    methodology: "goata", 
    difficulty: "advanced" as const,
    duration: 60,
    equipment: ["resistance bands", "medicine ball"],
    targetMuscles: ["full body", "posterior chain"],
    instructions: "Combine spiral movements with power generation for athletic performance",
    exercises: [
      { name: "Spiral Medicine Ball Throws", reps: "8 each direction", notes: "Full body spiral power" },
      { name: "Single Leg Deadlift to Sprint", reps: "6 each leg", notes: "Explosive spiral extension" },
      { name: "Rotational Band Pulls", reps: "12 each direction", notes: "Maintain spiral integrity" },
      { name: "Backward Bear Crawl", reps: "20 steps", notes: "Posterior chain dominance" }
    ]
  },

  // Soviet Training System Workouts
  {
    name: "Soviet Strength Foundation", 
    description: "Classic Soviet block periodization focusing on maximum strength development",
    category: "strength",
    methodology: "soviet",
    difficulty: "intermediate" as const,
    duration: 90,
    equipment: ["barbell", "plates", "squat rack"],
    targetMuscles: ["legs", "back", "shoulders"],
    instructions: "Focus on perfect technique with progressive overload following Soviet principles",
    exercises: [
      { name: "Back Squat", reps: "5x5 @ 85%", notes: "3-4 minute rest between sets" },
      { name: "Romanian Deadlift", reps: "4x6", notes: "Focus on posterior chain" },
      { name: "Overhead Press", reps: "4x5", notes: "Strict form, no leg drive" },
      { name: "Pendlay Rows", reps: "4x6", notes: "Explosive pull, controlled negative" }
    ]
  },
  {
    name: "Soviet Power Development",
    description: "Olympic lifting variations and explosive power training from Soviet methodology",
    category: "strength",
    methodology: "soviet",
    difficulty: "advanced" as const,
    duration: 75,
    equipment: ["barbell", "plates", "platform"],
    targetMuscles: ["full body", "explosive power"],
    instructions: "Focus on rate of force development and technical precision",
    exercises: [
      { name: "Power Clean", reps: "6x3 @ 80%", notes: "Focus on bar speed" },
      { name: "Front Squat", reps: "5x3 @ 90%", notes: "Maximum load with perfect form" },
      { name: "Push Press", reps: "4x4", notes: "Drive through legs first" },
      { name: "Snatch Pulls", reps: "4x5", notes: "Explosive triple extension" }
    ]
  },

  // NBA Style Basketball Training
  {
    name: "NBA On-Court Skills",
    description: "Professional basketball skill development focused on game situations",
    category: "skills",
    methodology: "nba",
    difficulty: "intermediate" as const,
    duration: 60,
    equipment: ["basketball", "cones", "ladder"],
    targetMuscles: ["legs", "core", "coordination"],
    instructions: "High-intensity basketball-specific movements with game-like scenarios",
    exercises: [
      { name: "Cone Dribbling Series", reps: "5 sets", notes: "Both hands, game speed" },
      { name: "Defensive Slide Ladder", reps: "4x20 seconds", notes: "Low stance, quick feet" },
      { name: "Shooting Off Movement", reps: "100 shots", notes: "Game spots, various angles" },
      { name: "1v1 Finishing", reps: "15 reps each hand", notes: "Contact finishes at rim" }
    ]
  },
  {
    name: "NBA Conditioning Circuit",
    description: "High-intensity conditioning matching NBA game demands",
    category: "cardio", 
    methodology: "nba",
    difficulty: "advanced" as const,
    duration: 45,
    equipment: ["basketball", "court"],
    targetMuscles: ["cardiovascular", "legs", "core"],
    instructions: "Game-pace conditioning with basketball movements",
    exercises: [
      { name: "Suicide Sprints", reps: "10 reps", notes: "Touch each line, full sprint" },
      { name: "Transition 3s", reps: "20 makes", notes: "Sprint to spot, shoot, repeat" },
      { name: "Defensive Shell Drill", reps: "5x45 seconds", notes: "Communication required" },
      { name: "Full Court Layups", reps: "2 minutes", notes: "Both hands, no misses" }
    ]
  },

  // Mixed/Functional Training
  {
    name: "Athletic Movement Prep",
    description: "Dynamic warm-up and movement preparation for any sport or activity",
    category: "mixed",
    methodology: "mixed",
    difficulty: "beginner" as const,
    duration: 30,
    equipment: ["none"],
    targetMuscles: ["full body", "mobility"],
    instructions: "Prepare the body for athletic movement with dynamic patterns",
    exercises: [
      { name: "Leg Swings", reps: "10 each direction", notes: "Front/back and side to side" },
      { name: "Arm Circles", reps: "10 each direction", notes: "Gradually increase size" },
      { name: "Walking High Knees", reps: "20 steps", notes: "Drive knee to chest" },
      { name: "Butt Kicks", reps: "20 steps", notes: "Heel to glute contact" },
      { name: "Side Shuffles", reps: "10 each direction", notes: "Stay low, don't cross feet" }
    ]
  }
];

export async function seedWorkoutDatabase() {
  try {
    console.log("Seeding workout database...");
    
    // Clear existing workouts (optional - comment out if you want to keep existing data)
    // await db.delete(workouts);
    
    // Insert seed workouts
    const insertedWorkouts = await db
      .insert(workouts)
      .values(seedWorkouts.map(workout => ({
        name: workout.name,
        description: workout.description,
        workoutType: workout.category as any, // Cast to match enum
        difficulty: workout.difficulty,
        duration: workout.duration,
        aiGenerated: false,
        isPopular: true,
      })))
      .returning();
    
    console.log(`Seeded ${insertedWorkouts.length} workouts successfully!`);
    return insertedWorkouts;
  } catch (error) {
    console.error("Error seeding workout database:", error);
    throw error;
  }
}