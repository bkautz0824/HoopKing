import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile hamburger menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">H</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              HoopMetrics
            </h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link 
              href="/" 
              className={`transition-colors hover:text-primary ${location === '/' ? 'text-foreground' : 'text-muted-foreground'}`}
              data-testid="nav-dashboard"
            >
              Dashboard
            </Link>
            <Link 
              href="/workouts" 
              className={`transition-colors hover:text-primary ${location === '/workouts' ? 'text-foreground' : 'text-muted-foreground'}`}
              data-testid="nav-workouts"
            >
              Workouts
            </Link>
            <Link 
              href="/fitness-plans" 
              className={`transition-colors hover:text-primary ${location === '/fitness-plans' ? 'text-foreground' : 'text-muted-foreground'}`}
              data-testid="nav-fitness-plans"
            >
              Fitness Plans
            </Link>
            <Link 
              href="/workout-management" 
              className={`transition-colors hover:text-primary ${location === '/workout-management' ? 'text-foreground' : 'text-muted-foreground'}`}
              data-testid="nav-workout-management"
            >
              Workout Management
            </Link>
            <Link 
              href="/analytics" 
              className={`transition-colors hover:text-primary ${location === '/analytics' ? 'text-foreground' : 'text-muted-foreground'}`}
              data-testid="nav-analytics"
            >
              Analytics
            </Link>
            <Link 
              href="/social" 
              className={`transition-colors hover:text-primary ${location === '/social' ? 'text-foreground' : 'text-muted-foreground'}`}
              data-testid="nav-social"
            >
              Social
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
            data-testid="button-notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7H4l5-5v5z"/>
            </svg>
            {/* <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></span> */}
          </Button>
          <div className="flex items-center space-x-2">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full border-2 border-primary object-cover" 
              />
            ) : (
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
            )}
            <span className="hidden md:block text-sm font-medium">
              {user?.firstName || user?.email?.split('@')[0] || 'User'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link 
              href="/" 
              className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                location === '/' ? 'text-foreground' : 'text-muted-foreground'
              }`}
              data-testid="mobile-nav-dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/workouts" 
              className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                location === '/workouts' ? 'text-foreground' : 'text-muted-foreground'
              }`}
              data-testid="mobile-nav-workouts"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Workouts
            </Link>
            <Link 
              href="/fitness-plans" 
              className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                location === '/fitness-plans' ? 'text-foreground' : 'text-muted-foreground'
              }`}
              data-testid="mobile-nav-fitness-plans"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Fitness Plans
            </Link>
            <Link 
              href="/workout-management" 
              className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                location === '/workout-management' ? 'text-foreground' : 'text-muted-foreground'
              }`}
              data-testid="mobile-nav-workout-management"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Workout Management
            </Link>
            <Link 
              href="/analytics" 
              className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                location === '/analytics' ? 'text-foreground' : 'text-muted-foreground'
              }`}
              data-testid="mobile-nav-analytics"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Analytics
            </Link>
            <Link 
              href="/social" 
              className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                location === '/social' ? 'text-foreground' : 'text-muted-foreground'
              }`}
              data-testid="mobile-nav-social"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Social
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
