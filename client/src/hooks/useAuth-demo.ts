import { User } from "@shared/schema";

// Demo version of useAuth that bypasses authentication
export function useAuth() {
  // Hardcoded mock user for frontend demo
  const mockUser: User = {
    id: "demo-user-123",
    email: "demo@hoopking.app",
    firstName: "Demo",
    lastName: "Player",
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date()
  };

  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
  };
}