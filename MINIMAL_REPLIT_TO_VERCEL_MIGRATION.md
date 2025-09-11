# HoopKing: Minimal Replit-to-Vercel Migration Guide

## Migration Philosophy: Preserve, Don't Redesign

**Objective**: Move existing HoopKing functionality from Replit-native to Vercel-native with **zero design changes** and **minimal code modifications**. Focus purely on infrastructure transition while maintaining all current features and user experience.

## Current State Analysis

### What Stays Exactly The Same
- ✅ All UI components and styling
- ✅ User authentication flow
- ✅ Database schema and data
- ✅ API endpoint functionality
- ✅ Frontend routing and navigation
- ✅ Business logic and features

### What Changes (Infrastructure Only)
- 🔄 Deployment platform: Replit → Vercel
- 🔄 Server architecture: Express.js → Vercel Functions
- 🔄 Development environment: Replit IDE → Local + Vercel CLI
- 🔄 Environment management: Replit Secrets → Vercel Environment Variables

## Step-by-Step Technical Migration

### Phase 1: Environment Setup (Day 1)

#### 1.1 Local Development Setup
```bash
# Clone existing repository
git clone https://github.com/bkautz0824/HoopKing.git
cd HoopKing

# Install dependencies (no changes needed)
npm install

# Install Vercel CLI
npm install -g vercel

# Initialize Vercel project
vercel

# Link to existing repository
vercel link
```

#### 1.2 Environment Variables Migration
```bash
# Copy from .replit to .env.local
DATABASE_URL=your_existing_database_url
NODE_ENV=development
PORT=3000
SESSION_SECRET=your_existing_session_secret
```

### Phase 2: Server Architecture Transition (Day 2-3)

#### 2.1 Express.js to Vercel Functions Mapping

**Current Express Structure:**
```
server/
├── index.ts          # Main Express app
├── routes/
│   ├── auth.ts       # Authentication routes
│   ├── workouts.ts   # Workout CRUD
│   ├── users.ts      # User management
│   └── plans.ts      # Fitness plans
```

**Vercel Functions Structure (1:1 mapping):**
```
api/
├── auth/
│   ├── login.ts      # POST /api/auth/login
│   ├── logout.ts     # POST /api/auth/logout
│   └── register.ts   # POST /api/auth/register
├── workouts/
│   ├── index.ts      # GET /api/workouts
│   ├── create.ts     # POST /api/workouts
│   └── [id].ts       # GET/PUT/DELETE /api/workouts/[id]
├── users/
│   ├── profile.ts    # GET/PUT /api/users/profile
│   └── stats.ts      # GET /api/users/stats
└── plans/
    ├── index.ts      # GET /api/plans
    └── create.ts     # POST /api/plans
```

#### 2.2 Express Route Conversion Pattern

**Before (Express):**
```typescript
// server/routes/workouts.ts
app.get('/api/workouts', async (req, res) => {
  const workouts = await getWorkouts(req.user.id);
  res.json(workouts);
});
```

**After (Vercel Function):**
```typescript
// api/workouts/index.ts
import { NextRequest } from 'next/server';
import { getWorkouts } from '../../server/lib/workouts';

export async function GET(request: NextRequest) {
  const user = await authenticateUser(request);
  const workouts = await getWorkouts(user.id);
  return Response.json(workouts);
}
```

### Phase 3: Database Connection Adaptation (Day 4)

#### 3.1 Connection Pool Adjustment
```typescript
// lib/database.ts (modified for Vercel)
import { Pool } from 'pg';

// Replit used persistent connections
// Vercel requires connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Vercel function limitation
  idleTimeoutMillis: 30000,
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
```

#### 3.2 Session Storage Migration
```typescript
// Current: In-memory sessions (Replit)
// New: Database sessions (Vercel compatible)

// Keep existing connect-pg-simple setup - no changes needed
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    pool: pool,
    tableName: 'user_sessions'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

### Phase 4: Frontend Adjustments (Day 5)

#### 4.1 API Client Updates (Zero UI Changes)
```typescript
// client/lib/api.ts
// Change base URL for development
const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api'  // Local development
  : '/api';                       // Production (Vercel)

// All existing API calls remain identical
export const createWorkout = (data) => 
  fetch(`${API_BASE}/workouts`, { method: 'POST', body: JSON.stringify(data) });
```

#### 4.2 Build Configuration
```typescript
// vite.config.ts (minimal changes)
export default defineConfig({
  plugins: [
    react(),
    // Remove Replit-specific plugins
    // @replit/vite-plugin-cartographer - REMOVE
    // @replit/vite-plugin-runtime-error-modal - REMOVE
  ],
  build: {
    outDir: 'dist',
    // Add Vercel-compatible build output
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000' // Development proxy
    }
  }
});
```

### Phase 5: Deployment Configuration (Day 6)

#### 5.1 Vercel Configuration
```json
// vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 5.2 Package.json Scripts Update
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "vercel:dev": "vercel dev",
    "deploy": "vercel --prod"
  }
}
```

## File-by-File Migration Checklist

### Files to Remove
- [ ] `.replit` (Replit configuration)
- [ ] `replit.md` (Replit documentation)
- [ ] `.local/` directory (Replit agent state)

### Files to Modify (Minimal Changes)
- [ ] `package.json` - Remove Replit dependencies
- [ ] `vite.config.ts` - Remove Replit plugins
- [ ] `server/index.ts` - Convert to Vercel functions
- [ ] Database connection files - Add pooling

### Files to Create
- [ ] `vercel.json` - Vercel configuration
- [ ] `.env.local` - Local environment variables
- [ ] `api/` directory structure - Function endpoints

### Files Unchanged (95% of codebase)
- [ ] All React components in `client/`
- [ ] All shared utilities in `shared/`
- [ ] Database schema files
- [ ] Styling and assets
- [ ] Business logic and utilities

## Testing Migration Success

### Development Environment Test
```bash
# Should work identically to Replit
npm run vercel:dev
# Visit http://localhost:3000
# Test all existing functionality
```

### Production Deployment Test
```bash
# Deploy to Vercel
vercel --prod
# Verify all features work on production URL
```

### Functionality Verification Checklist
- [ ] User registration/login works
- [ ] Workout creation and editing
- [ ] Fitness plan management
- [ ] Progress tracking
- [ ] All existing API endpoints respond correctly
- [ ] Database operations function normally
- [ ] Session management works
- [ ] File uploads (if any) work

## Rollback Strategy

### Immediate Rollback (if needed)
1. Revert Vercel deployment
2. Re-enable Replit environment
3. Point domain back to Replit (if applicable)

### Dual Environment (recommended)
- Keep Replit environment active during transition
- Test Vercel deployment thoroughly
- Switch DNS/domain only after full verification

## Performance Considerations

### Expected Improvements
- ✅ Faster global CDN delivery
- ✅ Better caching for static assets
- ✅ Automatic scaling for traffic spikes

### Potential Challenges
- ⚠️ Cold start times for Vercel Functions
- ⚠️ Database connection limits in serverless environment
- ⚠️ Session storage in distributed environment

### Mitigation Strategies
- Use connection pooling for database
- Implement proper session persistence
- Monitor function cold starts and optimize

## Timeline Summary

- **Day 1**: Local environment setup
- **Day 2-3**: Convert Express routes to Vercel Functions  
- **Day 4**: Database connection adaptation
- **Day 5**: Frontend proxy configuration
- **Day 6**: Deployment and testing
- **Day 7**: Production verification and DNS switch

## Success Metrics

- ✅ Zero user-facing functionality changes
- ✅ All existing features work identically
- ✅ Performance equal or better than Replit
- ✅ Development workflow improved with local setup
- ✅ Deployment pipeline simplified with Vercel

---

**Key Principle**: If users notice any difference in functionality or design, the migration has failed. This should be a purely infrastructure change with identical user experience.