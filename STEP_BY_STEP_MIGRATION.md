# HoopKing: Step-by-Step Migration Execution Plan

## Overview: Zero-Disruption Infrastructure Migration

This document provides exact commands and file changes needed to migrate HoopKing from Replit to Vercel with **zero design changes** and **minimal code modifications**.

## Pre-Migration Checklist

### Environment Backup
- [ ] Export current environment variables from Replit
- [ ] Backup database (if needed): `pg_dump $DATABASE_URL > hoopking_backup.sql`
- [ ] Document current Replit deployment URL
- [ ] Test all features work in current Replit environment

### Required Tools
```bash
# Install Vercel CLI globally
npm install -g vercel

# Verify Node.js version (should match Replit's Node 20)
node --version
```

## Migration Execution: Day-by-Day Plan

### Day 1: Local Setup & Environment

#### Step 1.1: Clone and Setup Local Environment
```bash
# Navigate to development directory
cd ~/development

# Clone repository (already done)
# cd HoopKing

# Install all dependencies
npm install

# Remove Replit-specific dependencies
npm uninstall @replit/vite-plugin-cartographer @replit/vite-plugin-runtime-error-modal
```

#### Step 1.2: Create Environment Files
```bash
# Create .env.local with current Replit values
cat > .env.local << 'EOF'
DATABASE_URL=your_current_replit_database_url
NODE_ENV=development  
PORT=3000
SESSION_SECRET=your_current_session_secret
EOF

# Create .env.example for repository
cat > .env.example << 'EOF'
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=development
PORT=3000
SESSION_SECRET=your_session_secret_here
EOF
```

#### Step 1.3: Update Vite Configuration
```bash
# Edit vite.config.ts - remove Replit plugins
cat > vite.config.ts << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
EOF
```

#### Step 1.4: Initialize Vercel Project
```bash
# Initialize Vercel project
vercel

# Follow prompts:
# - Link to existing project? N
# - Project name: hoopking
# - Directory: ./
# - Settings correct? Y

# Link to GitHub repository
vercel link
```

### Day 2: API Function Structure

#### Step 2.1: Create API Directory Structure
```bash
# Create Vercel Functions directory structure
mkdir -p api/auth
mkdir -p api/workouts  
mkdir -p api/users
mkdir -p api/plans

# Create index files for each endpoint group
touch api/auth/login.ts
touch api/auth/logout.ts
touch api/auth/register.ts
touch api/workouts/index.ts
touch api/workouts/create.ts
touch api/workouts/[id].ts
touch api/users/profile.ts
touch api/users/stats.ts
touch api/plans/index.ts
touch api/plans/create.ts
```

#### Step 2.2: Create Vercel Configuration
```bash
cat > vercel.json << 'EOF'
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
EOF
```

#### Step 2.3: Convert First API Endpoint (Example)
```bash
# Create api/workouts/index.ts
cat > api/workouts/index.ts << 'EOF'
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
EOF
```

### Day 3: Database & Authentication Migration

#### Step 3.1: Update Database Connection
```bash
# Create lib/database.ts for Vercel compatibility
mkdir -p lib
cat > lib/database.ts << 'EOF'
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export const db = drizzle(getPool());

// Re-export all existing database functions
export * from '../server/database/queries';
EOF
```

#### Step 3.2: Update Authentication Middleware
```bash
# Create server/auth/vercel-middleware.ts
cat > server/auth/vercel-middleware.ts << 'EOF'
import { NextRequest } from 'next/server';
import { validateSession } from './session-validator';

export async function authenticateUser(request: NextRequest) {
  const sessionCookie = request.cookies.get('connect.sid');
  
  if (!sessionCookie) {
    throw new Error('Not authenticated');
  }

  const user = await validateSession(sessionCookie.value);
  if (!user) {
    throw new Error('Invalid session');
  }

  return user;
}
EOF
```

### Day 4: Complete API Migration

#### Step 4.1: Convert All Remaining Endpoints
Use the pattern from Step 2.3 to convert each Express route:

```bash
# Authentication endpoints
# api/auth/login.ts, api/auth/logout.ts, api/auth/register.ts

# User endpoints  
# api/users/profile.ts, api/users/stats.ts

# Plans endpoints
# api/plans/index.ts, api/plans/create.ts

# Workout detail endpoint
# api/workouts/[id].ts
```

#### Step 4.2: Update Package.json Scripts
```bash
# Update scripts in package.json
cat > package.json << 'EOF'
{
  "name": "hoopking",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "vercel dev",
    "build": "vite build",
    "start": "vercel dev --listen 3000",
    "deploy": "vercel --prod",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  // ... keep all existing dependencies except Replit ones
}
EOF
```

### Day 5: Frontend Integration

#### Step 5.1: Update API Client
```bash
# Edit client/lib/api.ts
cat > client/lib/api.ts << 'EOF'
const API_BASE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api'
  : '/api';

// Keep all existing API functions - just update the base URL usage
export const workoutAPI = {
  getAll: () => fetch(`${API_BASE}/workouts`).then(r => r.json()),
  create: (data) => fetch(`${API_BASE}/workouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  // ... all other existing methods unchanged
};

// Export all other existing API functions unchanged
EOF
```

#### Step 5.2: Test Local Development
```bash
# Start local development server
vercel dev

# Verify in browser:
# - http://localhost:3000 (frontend loads)
# - All existing functionality works
# - API endpoints respond correctly
```

### Day 6: Production Deployment

#### Step 6.1: Environment Variables Setup
```bash
# Set production environment variables in Vercel
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add NODE_ENV production
```

#### Step 6.2: Deploy to Vercel
```bash
# Deploy to preview first
vercel

# Test preview deployment thoroughly
# Verify all functionality works

# Deploy to production
vercel --prod

# Note the production URL for DNS configuration
```

### Day 7: DNS & Verification

#### Step 7.1: Update DNS (if custom domain)
```bash
# Add custom domain in Vercel dashboard
# Or update DNS records to point to Vercel

# Verify SSL certificate provisioning
```

#### Step 7.2: Final Verification
```bash
# Test all functionality on production URL:
# - User registration/login
# - Workout creation and editing  
# - Fitness plan management
# - Progress tracking
# - All API endpoints
# - Database operations
# - Session persistence
```

## Critical Files Modified

### Files to Remove
```bash
rm .replit
rm replit.md  
rm -rf .local/
```

### Files to Modify
```
package.json          # Remove Replit deps, update scripts
vite.config.ts        # Remove Replit plugins
client/lib/api.ts     # Update API base URL
server/database/      # Add connection pooling
```

### Files to Create
```
vercel.json           # Vercel configuration
.env.local           # Local environment
.env.example         # Environment template
api/                 # Vercel Functions directory
lib/database.ts      # Vercel-compatible DB connection
```

## Rollback Procedures

### Immediate Rollback (Emergency)
```bash
# If critical issues arise
vercel remove hoopking

# Revert DNS to Replit
# Restore original package.json
git checkout HEAD~1 package.json vite.config.ts
```

### Gradual Rollback
```bash
# Disable Vercel deployment
vercel env add MAINTENANCE_MODE true

# Test fixes locally
vercel dev

# Redeploy when ready
vercel --prod
```

## Verification Commands

### Local Development Test
```bash
# Start development
vercel dev

# Test endpoints
curl http://localhost:3000/api/workouts
curl -X POST http://localhost:3000/api/auth/login

# Check database connection
npm run db:push
```

### Production Test  
```bash
# Test production endpoints
curl https://your-vercel-url.vercel.app/api/workouts

# Monitor function logs
vercel logs
```

## Success Criteria Checklist

### Technical Migration
- [ ] All API endpoints converted to Vercel Functions
- [ ] Database connections work with connection pooling
- [ ] Authentication/sessions persist correctly
- [ ] Local development environment functional
- [ ] Production deployment successful

### Functionality Preservation
- [ ] User login/registration works identically
- [ ] Workout creation/editing functions normally
- [ ] Progress tracking displays correctly
- [ ] All existing features work without changes
- [ ] Performance equal or better than Replit

### User Experience
- [ ] Zero visible changes to end users
- [ ] Same URLs and navigation
- [ ] Identical UI/UX behavior
- [ ] No data loss or corruption

---

**Migration Duration**: 7 days maximum  
**Downtime**: Zero (parallel deployment strategy)  
**Risk Level**: Low (preserve existing functionality)  
**Rollback Time**: < 30 minutes if needed