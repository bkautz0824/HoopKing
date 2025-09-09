import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";

export default function Workouts() {
  const { data: workouts, isLoading } = useQuery({
    queryKey: ["/api/workouts"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Workouts</h1>
            <p className="text-muted-foreground">Choose from our collection of basketball-focused workouts</p>
          </div>
          <Button className="gradient-orange" data-testid="button-create-workout">
            Create Workout
          </Button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass">
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts?.map((workout: any) => (
              <Card key={workout.id} className="glass hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    <Badge 
                      variant={workout.aiGenerated ? "default" : "secondary"}
                      className={workout.aiGenerated ? "gradient-blue border-0" : ""}
                    >
                      {workout.aiGenerated ? "AI" : workout.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {workout.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      {workout.duration} min
                    </span>
                    <Badge variant="outline">
                      {workout.workoutType}
                    </Badge>
                  </div>
                  <Button 
                    className="w-full gradient-orange"
                    data-testid={`button-start-workout-${workout.id}`}
                  >
                    Start Workout
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!workouts || workouts.length === 0) && (
          <Card className="glass text-center py-16">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No workouts available</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first workout or generating one with AI
              </p>
              <Button className="gradient-orange" data-testid="button-generate-ai-workout">
                Generate AI Workout
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
