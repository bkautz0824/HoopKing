import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-navy-900/20 court-pattern">
      {/* Header */}
      <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">H</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              HoopMetrics
            </h1>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="gradient-orange"
            data-testid="button-login"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-16">
            <Badge className="mb-4 gradient-blue text-white border-0">
              AI-Powered Training Platform
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              Elevate Your
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
                Basketball Game
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Train smarter with AI-powered workouts, real-time performance tracking, and personalized coaching. 
              Connect with the basketball community and dominate the court.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="gradient-orange text-lg px-8 py-4"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-start-training"
              >
                Start Training Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="glass border-border/50 hover:border-primary/50 transition-colors metric-card">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Personal Trainer</h3>
                <p className="text-muted-foreground">
                  Get personalized workouts powered by Claude AI, tailored to your skill level and goals.
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-border/50 hover:border-accent/50 transition-colors metric-card">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
                <p className="text-muted-foreground">
                  Track your heart rate, performance metrics, and progress with wearable device integration.
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-border/50 hover:border-green-500/50 transition-colors metric-card">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Social Community</h3>
                <p className="text-muted-foreground">
                  Compete with friends, join leaderboards, and share your basketball journey.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Join Thousands of Athletes</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                <div className="text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">50K+</div>
                <div className="text-muted-foreground">Workouts Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-500 mb-2">95%</div>
                <div className="text-muted-foreground">Improvement Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-500 mb-2">4.9★</div>
                <div className="text-muted-foreground">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
