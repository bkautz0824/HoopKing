# HoopKing: Vercel-Native Development Setup

## Objective: Preserve All Functionality, Change Only Infrastructure

This guide focuses exclusively on setting up a Vercel-native development environment that maintains 100% feature parity with the current Replit implementation.

## Current HoopKing Architecture Analysis

### Existing Tech Stack (Keep Unchanged)
- **Frontend**: React + Vite + Tailwind CSS
- **Backend Logic**: Express.js route handlers  
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js + express-session
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: TanStack Query

### Replit-Specific Elements (Remove Only These)
```typescript
// Remove from package.json
"@replit/vite-plugin-cartographer": "^0.3.0"
"@replit/vite-plugin-runtime-error-modal": "^0.0.3"

// Remove from vite.config.ts
import cartographer from '@replit/vite-plugin-cartographer'
import runtimeErrorModal from '@replit/vite-plugin-runtime-error-modal'
```

## Vercel-Native Project Structure

### Directory Structure (Preserve Existing + Add API Routes)
```
HoopKing/
├── client/                 # Keep unchanged
│   ├── src/
│   ├── components/
│   └── lib/
├── server/                 # Keep logic, convert to functions
│   ├── auth/
│   ├── database/
│   └── routes/
├── shared/                 # Keep unchanged
│   └── schema.ts
├── api/                    # NEW: Vercel Functions
│   ├── auth/
│   ├── workouts/
│   ├── users/
│   └── plans/
├── public/                 # Keep unchanged
└── package.json           # Minor modifications
```

## Step-by-Step Vercel-Native Setup

### 1. Dependency Management

#### Remove Replit Dependencies
```bash
npm uninstall @replit/vite-plugin-cartographer @replit/vite-plugin-runtime-error-modal
```

#### Add Vercel Dependencies
```bash
npm install @vercel/node
npm install -g vercel
```

#### Updated package.json Scripts
```json
{
  "scripts": {
    "dev": "vercel dev",
    "build": "vite build",
    "start": "vercel dev --listen 3000",
    "deploy": "vercel --prod",
    "db:push": "drizzle-kit push"
  }
}
```

### 2. Environment Configuration

#### Create .env.local (Replace Replit Secrets)
```bash
# Database (same connection string as Replit)
DATABASE_URL=postgresql://username:password@host:port/database

# Development
NODE_ENV=development
PORT=3000

# Authentication (same as current)
SESSION_SECRET=your_existing_session_secret

# If using external services
ANTHROPIC_API_KEY=your_key_if_needed
```

#### Create .env.example
```bash
DATABASE_URL=
SESSION_SECRET=
NODE_ENV=development
PORT=3000
```

### 3. Vercel Configuration

#### Create vercel.json
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Create .vercelignore
```
node_modules
.env.local
.local
dist
.git
```

### 4. Convert Express Routes to Vercel Functions

#### Express Route Pattern (Current)
```typescript
// server/routes/workouts.ts
router.get('/workouts', authenticateUser, async (req, res) => {
  const workouts = await getWorkouts(req.user.id);
  res.json(workouts);
});

router.post('/workouts', authenticateUser, async (req, res) => {
  const workout = await createWorkout(req.user.id, req.body);
  res.json(workout);
});
```

#### Vercel Function Pattern (New)
```typescript
// api/workouts/index.ts
import { NextRequest } from 'next/server';
import { authenticateUser } from '../../server/auth/middleware';
import { getWorkouts, createWorkout } from '../../server/database/workouts';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    const workouts = await getWorkouts(user.id);
    return Response.json(workouts);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    const body = await request.json();
    const workout = await createWorkout(user.id, body);
    return Response.json(workout);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
```

### 5. Authentication Adaptation

#### Session Management (Minimal Changes)
```typescript
// lib/session.ts
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './database';

const PgSession = connectPgSimple(session);

export const sessionConfig = {
  store: new PgSession({
    pool: pool,
    tableName: 'user_sessions' // Keep existing table
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
};
```

#### Authentication Middleware Adaptation
```typescript
// server/auth/middleware.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function authenticateUser(request: NextRequest) {
  const sessionCookie = request.cookies.get('connect.sid');
  
  if (!sessionCookie) {
    throw new Error('Not authenticated');
  }

  // Use existing session validation logic
  const user = await validateSession(sessionCookie.value);
  return user;
}
```

### 6. Database Connection Optimization

#### Connection Pooling for Vercel Functions
```typescript
// lib/database.ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

// Singleton pattern for connection reuse
let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1, // Vercel function limit
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export const db = drizzle(getPool());

// Keep all existing query functions unchanged
export * from '../server/database/queries';
```

### 7. Frontend API Client Updates

#### Update API Base URL (Only Change)
```typescript
// client/lib/api.ts
const API_BASE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api'
  : '/api';

// All existing API functions remain identical
export const workoutAPI = {
  getAll: () => fetch(`${API_BASE}/workouts`).then(r => r.json()),
  create: (data) => fetch(`${API_BASE}/workouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  // ... all other existing methods unchanged
};
```

### 8. Development Workflow

#### Local Development Commands
```bash
# Start local development (replaces 'npm run dev')
vercel dev

# Build for production
npm run build

# Deploy to preview
vercel

# Deploy to production  
vercel --prod

# Database operations (unchanged)
npm run db:push
```

#### VS Code Configuration
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "vercel.autoDeployments": false
}
```

### 9. Testing Parity

#### Functionality Verification Script
```typescript
// scripts/verify-migration.ts
import { describe, test, expect } from 'vitest';

describe('Migration Parity Tests', () => {
  test('All existing endpoints respond', async () => {
    const endpoints = [
      '/api/auth/login',
      '/api/workouts',
      '/api/users/profile',
      '/api/plans'
    ];
    
    for (const endpoint of endpoints) {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      expect(response.status).not.toBe(404);
    }
  });

  test('Database connections work', async () => {
    const { db } = await import('../lib/database');
    const result = await db.select().from(users).limit(1);
    expect(result).toBeDefined();
  });
});
```

## Migration Validation Checklist

### Pre-Migration State Capture
- [ ] Document all current API endpoints
- [ ] Export user data and workout plans
- [ ] List all current features and flows
- [ ] Take screenshots of all UI states

### Post-Migration Verification
- [ ] All API endpoints respond identically
- [ ] User authentication works seamlessly
- [ ] Workout creation/editing functions
- [ ] Progress tracking displays correctly
- [ ] Database queries return same results
- [ ] Session management persists properly

### Performance Baseline
- [ ] Page load times ≤ current Replit performance
- [ ] API response times ≤ current benchmarks
- [ ] Database query performance maintained

## Rollback Plan

### Immediate Issues
1. Keep Replit environment active during transition
2. Use DNS/domain switching for instant rollback
3. Maintain database backups before migration

### Code Rollback
```bash
# If migration fails, restore previous state
git checkout main
git revert <migration-commits>
vercel remove <project-name>
```

## Success Criteria

### User Experience (Primary)
- ✅ Zero visible changes to end users
- ✅ All existing features work identically  
- ✅ Performance equal or better than Replit

### Developer Experience (Secondary)
- ✅ Local development environment functional
- ✅ Faster deployment pipeline
- ✅ Better debugging capabilities
- ✅ Improved monitoring and analytics

---

**Key Principle**: This migration should be invisible to users. Focus solely on infrastructure changes while preserving every aspect of the current user experience and functionality.