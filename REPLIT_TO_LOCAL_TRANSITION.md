# HoopKing: Replit to Platform-Agnostic Transition Guide

## Overview
This document outlines the necessary steps and considerations for transitioning the HoopKing application from Replit-specific development to a platform-agnostic local development environment.

## Current Replit Dependencies

### 1. **Environment Configuration**
- **Current**: Uses `.replit` file for Replit-specific configuration
- **Action Required**: Create platform-agnostic environment setup

### 2. **Dependencies to Address**

#### Replit-Specific Packages (Remove/Replace)
```json
"@replit/vite-plugin-cartographer": "^0.3.0"
"@replit/vite-plugin-runtime-error-modal": "^0.0.3"
```

#### Replit Agent Integration
- **Current**: Uses Replit Agent with Anthropic integration
- **Files**: `.local/state/replit/agent/` directory contains agent state
- **Action Required**: Remove or replace with local development tools

## Required Setup Steps

### 1. **Environment Variables Setup**
Create `.env` file with required variables:
```bash
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=development
PORT=5000
ANTHROPIC_API_KEY=your_anthropic_api_key_if_needed
SESSION_SECRET=your_session_secret
```

### 2. **Database Setup**
- **Current**: Uses PostgreSQL 16 (Replit managed)
- **Options**:
  - Local PostgreSQL installation
  - Docker PostgreSQL container
  - Cloud database (Neon, Supabase, Railway)
  
#### Docker PostgreSQL Setup (Recommended)
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: hoopking
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 3. **Package.json Updates**
Remove Replit-specific dependencies:
```bash
npm uninstall @replit/vite-plugin-cartographer @replit/vite-plugin-runtime-error-modal
```

### 4. **Vite Configuration Update**
Update `vite.config.ts` to remove Replit plugins:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
```

### 5. **Development Scripts Update**
Current scripts should work cross-platform:
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run db:push` - Database migrations

## Platform-Specific Setup Instructions

### **macOS/Linux**
1. Install Node.js 20+
2. Install PostgreSQL or Docker
3. Clone repository: `git clone https://github.com/bkautz0824/HoopKing.git`
4. Install dependencies: `npm install`
5. Setup environment variables
6. Run database migrations: `npm run db:push`
7. Start development: `npm run dev`

### **Windows**
1. Install Node.js 20+ from nodejs.org
2. Install Docker Desktop or PostgreSQL
3. Use Git Bash or PowerShell for commands
4. Follow same steps as macOS/Linux

### **VS Code Setup (Recommended)**
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## Database Migration Strategy

### Current Database Export (If Needed)
```bash
# Export from Replit database
pg_dump DATABASE_URL > hoopking_backup.sql

# Import to new database
psql NEW_DATABASE_URL < hoopking_backup.sql
```

## Authentication Considerations

### Current Setup
- Uses Passport.js with local strategy
- Express sessions with connect-pg-simple
- No Replit-specific auth dependencies

### No Changes Required
The authentication system is already platform-agnostic.

## Deployment Options

### 1. **Railway** (Recommended)
- Easy PostgreSQL integration
- Git-based deployment
- Automatic environment management

### 2. **Vercel** (Frontend + Serverless Functions)
- Requires database separation
- May need architecture changes

### 3. **Docker Deployment**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "start"]
```

## Testing Checklist

- [ ] Environment variables configured
- [ ] Database connection working
- [ ] All dependencies installed
- [ ] Development server starts (`npm run dev`)
- [ ] Production build works (`npm run build`)
- [ ] Database migrations run (`npm run db:push`)
- [ ] Authentication flows work
- [ ] API endpoints functional
- [ ] Frontend renders correctly

## Files to Clean Up

### Remove Replit-Specific Files
- `.replit` (optional - keep for reference)
- `.local/` directory (Replit agent state)
- Any Replit deployment configurations

### Create New Files
- `.env` (environment variables)
- `.env.example` (template)
- `docker-compose.yml` (if using Docker)
- `README.md` (update with local setup instructions)

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure DATABASE_URL is correct
2. **Port Conflicts**: Change PORT in .env if 5000 is busy
3. **TypeScript Errors**: Run `npm run check` to validate types
4. **Missing Dependencies**: Run `npm install` to ensure all packages installed

### Development vs Production
- Development: Uses tsx for hot reloading
- Production: Uses compiled JavaScript from build process

## Next Steps
1. Complete environment setup
2. Test all functionality locally
3. Set up CI/CD pipeline
4. Deploy to chosen platform
5. Update documentation with platform-specific instructions

---

**Repository**: https://github.com/bkautz0824/HoopKing
**Last Updated**: $(date)