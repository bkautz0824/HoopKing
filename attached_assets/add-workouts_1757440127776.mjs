
// Script to add new workouts to existing database
import { db } from './server/db';
import { workouts, exercises } from './shared/schema';
import { initialWorkoutData } from './client/src/lib/workoutData';

async function addNewWorkouts() {
  const existingWorkouts = await db.select().from(workouts);
  const existingWorkoutNames = existingWorkouts.map(w => w.name);
  
  // Get categories
  const categories = await db.select().from(workout_categories);
  const categoryMap = new Map();
  categories.forEach(cat => {
    if (cat.name === 'Gym Training') categoryMap.set('Gym Training', cat.id);
    if (cat.name === 'Court Skills') categoryMap.set('Court Skills', cat.id);
  });
  
  // Add new workouts that don't exist yet  
  for (const workoutData of initialWorkoutData.workouts) {
    if (!existingWorkoutNames.includes(workoutData.name)) {
      const categoryId = categoryMap.get(workoutData.category);
      if (!categoryId) continue;
      
      const [workout] = await db.insert(workouts).values({
        name: workoutData.name,
        description: workoutData.description,
        categoryId,
        duration: workoutData.duration,
        difficulty: workoutData.difficulty,
        isPopular: workoutData.isPopular,
      }).returning();
      
      // Add exercises
      for (const exerciseData of workoutData.exercises) {
        await db.insert(exercises).values({
          workoutId: workout.id,
          name: exerciseData.name,
          description: exerciseData.description,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          duration: exerciseData.duration,
          restTime: exerciseData.restTime,
          order: exerciseData.order,
          instructions: exerciseData.instructions,
          tips: exerciseData.tips,
        });
      }
      
      console.log('Added workout:', workoutData.name);
    }
  }
}

addNewWorkouts().then(() => {
  console.log('Finished adding new workouts');
}).catch(console.error);
