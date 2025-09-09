import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function SocialFeatures() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="glass">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-6" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const leaderboard = dashboardData?.leaderboard || [];
  const activityFeed = dashboardData?.activityFeed || [];

  return (
    <section className="mb-12">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Leaderboard */}
        <Card className="glass rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Weekly Leaderboard</CardTitle>
              <Button variant="ghost" className="text-sm text-accent hover:text-accent/80" data-testid="button-view-all-leaderboard">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((entry: any, index: number) => (
                <div 
                  key={entry.user.id} 
                  className={`flex items-center space-x-4 p-3 rounded-lg ${
                    entry.rank === 1 
                      ? 'bg-gradient-to-r from-primary/10 to-orange-500/5 border border-primary/20' 
                      : 'hover:bg-muted/20 transition-colors'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    entry.rank === 1 ? 'bg-primary' : 'bg-secondary'
                  }`}>
                    <span className={`font-bold text-sm ${
                      entry.rank === 1 ? 'text-primary-foreground' : 'text-secondary-foreground'
                    }`}>
                      {entry.rank}
                    </span>
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={entry.user.profileImageUrl} />
                    <AvatarFallback>
                      {entry.user.firstName?.[0] || entry.user.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium" data-testid={`leaderboard-user-${entry.rank}`}>
                      {entry.user.firstName || entry.user.email?.split('@')[0] || 'User'}
                      {entry.rank === 1 && ' (You)'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entry.profile.totalPoints?.toLocaleString() || 0} points
                    </p>
                  </div>
                  <div className="text-lg">
                    {entry.rank === 1 && '🏆'}
                    {entry.rank === 2 && '🥈'}
                    {entry.rank === 3 && '🥉'}
                  </div>
                </div>
              ))}
              
              {leaderboard.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No leaderboard data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="glass rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <Button variant="ghost" className="text-sm text-accent hover:text-accent/80" data-testid="button-view-all-activity">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityFeed.map((activity: any) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-3 rounded-lg bg-background border border-border hover:border-primary/20 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.activityType === 'workout_completed' ? 'bg-green-500' :
                    activity.activityType === 'achievement_unlocked' ? 'bg-primary' :
                    activity.activityType === 'personal_best' ? 'bg-accent' : 'bg-muted'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <strong>{activity.user.firstName || activity.user.email?.split('@')[0] || 'User'}</strong>{' '}
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString()} • 
                      {activity.points && ` +${activity.points} XP`}
                    </p>
                  </div>
                </div>
              ))}
              
              {activityFeed.length === 0 && (
                <>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-background border border-border">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm"><strong>You</strong> joined HoopMetrics</p>
                      <p className="text-xs text-muted-foreground">Welcome to the community!</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
