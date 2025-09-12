import { NextRequest } from 'next/server';
import { storage } from '../server/storage';

// Mock authentication for local testing
export async function authenticateUser(request: NextRequest) {
  // Skip authentication in development mode - return mock user
  if (process.env.NODE_ENV === 'development') {
    return {
      claims: { sub: 'mock-user-123' },
      id: 'mock-user-123',
      email: 'test@example.com',
      username: 'testuser'
    };
  }

  // Production authentication logic would go here
  const sessionCookie = request.cookies.get('connect.sid');
  
  if (!sessionCookie) {
    throw new Error('Not authenticated');
  }

  try {
    // TODO: Implement proper session validation for production
    const userId = 'temp-user-id';
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return { claims: { sub: userId }, ...user };
  } catch (error) {
    throw new Error('Invalid session');
  }
}

export function createAuthenticatedHandler(handler: (request: NextRequest, user: any) => Promise<Response>) {
  return async (request: NextRequest) => {
    try {
      const user = await authenticateUser(request);
      return await handler(request, user);
    } catch (error) {
      return Response.json({ error: error.message }, { status: 401 });
    }
  };
}