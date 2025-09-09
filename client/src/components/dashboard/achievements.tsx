import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function Achievements() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <Card className="glass">
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-secondary/10 rounded-lg p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32 mb-4" />
                  <Skeleton className="h-2 w-full mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const achievements = dashboardData?.achievements || [];
  const unlockedCount = achievements.filter((a: any) => a.isUnlocked).length;
  const totalAchievements = 25; // Mock total

  return (
    <section className="mb-12">
      <Card className="glass rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Achievements & Progress</CardTitle>
            <div className="text-sm text-muted-foreground">
              <span data-testid="achievements-unlocked">{unlockedCount}</span> of{' '}
              <span data-testid="achievements-total">{totalAchievements}</span> unlocked
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mock Achievement Cards */}
            
            {/* Achievement Card - Unlocked */}
            <div className="bg-gradient-to-br from-primary/20 to-orange-500/10 rounded-lg p-4 border border-primary/30 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <span className="text-2xl animate-bounce-subtle">🏆</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Streak Master</h4>
                <p className="text-xs text-muted-foreground">Complete 15 consecutive workouts</p>
                <div className="flex items-center space-x-2">
                  <Progress value={100} className="flex-1 h-2" />
                  <span className="text-xs font-medium text-primary">15/15</span>
                </div>
              </div>
            </div>
            
            {/* Achievement Card - In Progress */}
            <div className="bg-secondary/30 rounded-lg p-4 border border-border relative">
              <div className="absolute top-2 right-2 opacity-50">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Skills Specialist</h4>
                <p className="text-xs text-muted-foreground">Master 5 different skill categories</p>
                <div className="flex items-center space-x-2">
                  <Progress value={60} className="flex-1 h-2" />
                  <span className="text-xs font-medium">3/5</span>
                </div>
              </div>
            </div>
            
            {/* Achievement Card - Locked */}
            <div className="bg-secondary/10 rounded-lg p-4 border border-border/50 relative opacity-50">
              <div className="absolute top-2 right-2">
                <span className="text-2xl">🔒</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Elite Athlete</h4>
                <p className="text-xs text-muted-foreground">Reach Pro level in all categories</p>
                <div className="flex items-center space-x-2">
                  <Progress value={25} className="flex-1 h-2" />
                  <span className="text-xs font-medium">1/4</span>
                </div>
              </div>
            </div>
            
            {/* Challenge Card */}
            <div className="bg-gradient-to-br from-accent/20 to-blue-500/10 rounded-lg p-4 border border-accent/30 relative">
              <div className="absolute top-2 right-2">
                <span className="text-2xl animate-pulse">⚡</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Weekly Challenge</h4>
                <p className="text-xs text-muted-foreground">Score 100+ in accuracy drills</p>
                <div className="flex items-center space-x-2">
                  <Progress value={87} className="flex-1 h-2" />
                  <span className="text-xs font-medium text-accent">87/100</span>
                </div>
              </div>
            </div>

            {/* Render actual achievements if available */}
            {achievements.map((achievement: any) => (
              <div 
                key={achievement.id}
                className={`rounded-lg p-4 border relative ${
                  achievement.isUnlocked 
                    ? 'bg-gradient-to-br from-primary/20 to-orange-500/10 border-primary/30'
                    : 'bg-secondary/10 border-border/50 opacity-50'
                }`}
              >
                <div className="absolute top-2 right-2">
                  <span className="text-2xl">
                    {achievement.isUnlocked ? '🏆' : '🔒'}
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{achievement.name}</h4>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={achievement.isUnlocked ? 100 : (achievement.progress || 0)} 
                      className="flex-1 h-2" 
                    />
                    <span className={`text-xs font-medium ${
                      achievement.isUnlocked ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {achievement.isUnlocked ? 'Complete' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
