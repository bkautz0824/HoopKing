# Master Sheet: Development Best Practices & Tools (1)

# Master Sheet: Development Best Practices & Tools

*The definitive guide for modern web development - what to use, when to use it, and why*

---

## 🎯 Quick Reference Philosophy

**The Stack Hierarchy:**

1. **AI-Enhanced Development** - Use AI to accelerate every step
2. **JavaScript-First** - Minimize context switching, maximize velocity
3. **Component-Driven** - Build once, reuse everywhere
4. **Performance-Optimized** - Fast by default, scalable by design

---

## 🚀 Core Foundation Stack

### **Next.js 14+ (App Router + TypeScript)**

- **What**: React meta-framework with built-in optimization
- **When**: Every new project (unless specific constraints)
- **Problem Solved**: Setup complexity, performance optimization, deployment
- **Setup**: `npx create-next-app@latest my-app --typescript --tailwind --app`

### **Vercel (Hosting + Edge Functions)**

- **What**: Deployment platform with global edge network
- **When**: For production deployments, edge computing needs
- **Problem Solved**: DevOps complexity, global performance, automatic scaling
- **Setup**: Connect GitHub repo, auto-deploys on push

### **Neon + Prisma (Database + ORM)**

- **What**: PostgreSQL with type-safe database access
- **When**: Need structured data, complex queries, relationships
- **Problem Solved**: Database setup, type safety, schema management
- **Setup**: `npm install prisma @prisma/client` + Neon dashboard

---

## 🤖 AI-Enhanced Development Tools

### **Claude Code + Figma MCP Server** ⭐ *NEW*

- **What**: Terminal-based AI coding assistant that reads Figma designs
- **When**: Converting designs to code, building components from mockups
- **Problem Solved**: Manual design-to-code translation, context switching
- **Setup**:
    
    ```bash
    npm install -g @anthropic-ai/claude-code
    claude mcp add --transport sse figma-dev-mode-mcp-server [http://127.0.0.1:3845/sse](http://127.0.0.1:3845/sse)
    ```
    
- **Usage**: `"Convert this sign-up card design to code: [figma-link]"`

### **Chat SDK by Vercel** ⭐ *NEW*

- **What**: Fully customizable chatbot framework with modern features
- **When**: Building AI chat interfaces, customer support bots
- **Problem Solved**: Complex chat UI implementation, AI integration
- **Features**: Artifacts, reasoning, best practices built-in

### [**v0.dev](http://v0.dev) (AI Component Generation)**

- **What**: Vercel's AI-powered component generator
- **When**: Need custom components quickly, prototyping UIs
- **Problem Solved**: Blank page syndrome, repetitive component building
- **Usage**: Describe component → Get production-ready code
- **Notable Collections**: ElevenLabs starters - [https://v0.app/@elevenlabs-devs](https://v0.app/@elevenlabs-devs)

---

## 🎨 UI Component Libraries (In Priority Order)

### **1. shadcn/ui (Foundation)**

- **What**: Copy-paste React components with Radix + Tailwind
- **When**: Every project as the base component system
- **Problem Solved**: Component library maintenance, design consistency
- **Setup**: `npx shadcn-ui@latest init`
- **Essential Components**: `button card input dialog table form`

### **2. Shadd (Developer Experience)** ⭐ *NEW*

- **What**: Global shorthand for `npx shadcn add` with package manager detection
- **When**: Adding shadcn components in any project
- **Problem Solved**: Remembering different package manager commands
- **Setup**: `npm i -g shadd@latest`
- **Usage**: `shadd button card dialog` (instead of `npx shadcn@latest add`)

### **3. Animate UI** ⭐ *NEW*

- **What**: Motion-animated components built with React, TypeScript, Tailwind, Framer Motion
- **When**: Need animated components that complement shadcn/ui
- **Problem Solved**: Building complex animations from scratch
- **Features**: Dynamic backgrounds, animated text, motion effects

### **4. Magic UI (Enhanced shadcn)**

- **What**: shadcn/ui components with built-in animations and enhancements
- **When**: Need more visual flair than basic shadcn components
- **Problem Solved**: Adding animations and interactions to basic components
- **Use Cases**: Landing pages, marketing sites, interactive dashboards

### **5. React Bits** ⭐ *NEW*

- **What**: Text animation components and effects library
- **When**: Need specific text animations (shuffle, typewriter, etc.)
- **Problem Solved**: Complex text animation implementations
- **Example**: Shuffle text animation for dynamic content

### **6. Tremor (Data Visualization)**

- **What**: Dashboard components with built-in charts and analytics
- **When**: Building admin dashboards, analytics pages
- **Problem Solved**: Complex data visualization from scratch
- **Components**: BarChart, LineChart, DonutChart, KPI cards

---

## ⚡ Performance & Development Tools

### **React Scan** ⭐ *NEW*

- **What**: Zero-config performance monitoring that highlights slow components
- **When**: Optimizing React app performance, debugging renders
- **Problem Solved**: Identifying performance bottlenecks without complex setup
- **Setup**: `<script src="//[unpkg.com/react-scan/dist/auto.global.js"></script>](http://unpkg.com/react-scan/dist/auto.global.js"></script>)`
- **Result**: Visual highlights of components that need optimization

### **Skiper UI** ⭐ *NEW*

- **What**: Component library/design system
- **When**: Need additional UI components beyond shadcn
- **Problem Solved**: Extended component needs, design system gaps

### **New Design & UI Tools** ⭐ *LATEST ADDITIONS*

- **TweakCN**: [https://tweakcn.com](https://tweakcn.com) - Tailwind CSS class tweaking tool
- **PatternCraft**: [https://patterncraft.fun](https://patterncraft.fun) - Pattern and background generators
- **Lina Adaptive Scroll Area**: [https://lina.sameer.sh](https://lina.sameer.sh) - Custom scroll components
- **Evil Charts**: [https://evilcharts.com](https://evilcharts.com) - Unique chart and data visualization library
- **React Wheel Picker**: [https://react-wheel-picker.chanhdai.com](https://react-wheel-picker.chanhdai.com) - iOS-style wheel picker
- **Cook**: [https://cook.engage-dev.com](https://cook.engage-dev.com) - Component cooking and customization
- **Shadcn TipTap**: [https://tiptap.niazmorshed.dev](https://tiptap.niazmorshed.dev) - Rich text editor with shadcn styling
- **Shadcn Prose**: [https://shadcn-prose.vercel.app](https://shadcn-prose.vercel.app) - Beautiful prose and content styling

---

## 📚 Essential Library Stack

### **🎨 UI & Styling**

```bash
# Headless UI primitives
npm install @radix-ui/react-*

# Type-safe validation  
npm install zod

# Conditional styling utilities
npm install clsx tailwind-merge

# Beautiful icons
npm install lucide-react

# Smooth animations
npm install framer-motion

# Spaceman RTA - React Theme Animation
npm install @space-man/react-theme-animation
# Demo: [https://spaceman-rta-vite.netlify.app](https://spaceman-rta-vite.netlify.app)
```

### **📝 Forms & Validation**

```bash
# Form management
npm install react-hook-form

# Form validation integration
npm install @hookform/resolvers
```

### **🗃️ State & Data Management**

```bash
# Lightweight state management
npm install zustand

# Backend as a service
npm install @supabase/supabase-js

# Type-safe database ORM
npm install prisma @prisma/client

# Data visualization
npm install recharts
```

### **🎭 User Experience**

```bash
# Toast notifications
npm install sonner

# Mobile-friendly drawers
npm install vaul

# Touch-friendly carousels
npm install embla-carousel

# Dark mode support
npm install next-themes

# Date manipulation
npm install date-fns
```

### **📊 Analytics & Monitoring**

```bash
# User insights
npm install @vercel/analytics

# Booking integration
npm install @calcom/embed-react
```

### **📱 Mobile Development (React Native)**

```bash
# React Native development platform
npm install expo

# Navigation
npm install @react-navigation/native

# Performance animations
npm install react-native-reanimated

# Native bottom sheets
npm install @gorhom/bottom-sheet

# Lottie animations
npm install @lottiefiles/dotlottie-react

# Performance optimized lists
npm install @shopify/flash-list
# See comparison: [https://snack.expo.dev/@naqvitalha/flashlist-vs-legendlist-vs-flatlist](https://snack.expo.dev/@naqvitalha/flashlist-vs-legendlist-vs-flatlist)
```

### **🎬 React Native Performance Tools**

- **FlashList vs FlatList**: Optimized list component with better performance
- **Expo Development**: Modern React Native development platform
- **ConvExpo**: [https://github.com/0rtbo/convexpo](https://github.com/0rtbo/convexpo) - Expo + Convex integration

---

## 🛠️ Development Workflow Best Practices

### **Project Structure (Recommended)**

```
my-app/
├── app/                    # Next.js 14 App Router
│   ├── (dashboard)/       # Route groups
│   ├── (auth)/           # Authentication routes
│   ├── api/              # API routes
│   │   ├── chat/         # AI chat endpoints
│   │   └── scrape/       # Data collection
│   └── globals.css
├── components/            # React components
│   ├── ui/               # shadcn base components
│   ├── animated/         # Animate UI components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                  # Utilities & services
│   ├── services/         # Business logic
│   ├── utils.ts          # Helper functions
│   └── prisma.ts         # Database client
├── prisma/
│   └── schema.prisma     # Database schema
└── scripts/              # Automation scripts
```

### **Essential package.json Scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "ui:add": "shadd",
    "ui:generate": "npx v0@latest",
    "perf:scan": "echo 'React Scan active in dev mode'"
  }
}
```

### **Component Selection Decision Tree**

1. **Basic Component Needed?** → Start with shadcn/ui (`shadd button`)
2. **Need Animation?** → Check Animate UI → Fallback to Magic UI
3. **Text Animation Specific?** → React Bits
4. **Data Visualization?** → Tremor
5. **Custom/Complex?** → [v0.dev](http://v0.dev) generation → Manual development

---

## 🚦 When to Use What

### **🎯 Choose shadcn/ui when:**

- Building forms, layouts, basic interactions
- Need consistent, accessible components
- Want copy-paste customization

### **🎯 Choose Animate UI when:**

- Building landing pages or marketing sites
- Need impressive visual effects
- Want motion design without complexity

### **🎯 Choose Magic UI when:**

- shadcn/ui is too plain
- Need subtle animations and enhancements
- Building interactive dashboards

### **🎯 Choose React Bits when:**

- Need specific text animations
- Building dynamic content displays
- Want typewriter, shuffle, or text morphing effects

### **🎯 Choose Tremor when:**

- Building admin dashboards
- Need data visualization
- Want charts and analytics components

### **🎯 Choose [v0.dev](http://v0.dev) when:**

- Need custom components quickly
- Have specific design requirements
- Want AI assistance in component creation

---

## 🏆 Performance Optimization Checklist

### **Development Phase**

- [ ]  Use React Scan to identify performance issues
- [ ]  Implement proper loading states with Suspense
- [ ]  Use proper key props for lists
- [ ]  Lazy load heavy components

### **Production Phase**

- [ ]  Enable Vercel Analytics
- [ ]  Configure proper caching headers
- [ ]  Optimize images with Next.js Image component
- [ ]  Use Vercel Edge Functions for global performance

---

## 🔥 Rapid Development Workflow (60-minute app)

### **Minutes 1-15: Foundation**

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npm install prisma @prisma/client
npx shadcn-ui@latest init
npm install -g shadd
```

### **Minutes 16-30: Core Components**

```bash
shadd button card input dialog table
# Add React Scan script to layout
# Set up basic database schema
```

### **Minutes 31-45: Features & AI**

```bash
npm install ai @ai-sdk/anthropic
# Implement chat interface with Chat SDK patterns
# Add data fetching and display
```

### **Minutes 46-60: Polish & Deploy**

```bash
# Add animations with Animate UI
# Performance check with React Scan
# Deploy to Vercel
```

---

## 🎯 Key Takeaways

1. **Start with shadcn/ui + shadd** for foundation
2. **Add React Scan immediately** for performance monitoring
3. **Use AI tools (Claude Code, [v0.dev](http://v0.dev))** to accelerate development
4. **Layer animations progressively** (Animate UI → Magic UI → Custom)
5. **Optimize continuously** with built-in tools
6. **Stay in the JavaScript ecosystem** to minimize context switching

This master sheet represents the accumulated wisdom of modern web development - use it as your north star for building fast, beautiful, and maintainable applications.

---

## 🎆 Latest Additions & Experimental Tools

### **🎮 3D & Interactive Libraries**

- **WiFi 3D Fusion**: [https://github.com/MaliosDark/wifi-3d-fusion](https://github.com/MaliosDark/wifi-3d-fusion) - Cool 3D visualization library
- **Alternative 3D Library**: Advanced 3D components and interactions
    - Repo: [https://github.com/username/3d-library-repo](https://github.com/username/3d-library-repo) (linked from Twitter)
- **ZCF Framework**: [https://github.com/UfoMiao/zcf](https://github.com/UfoMiao/zcf) - Experimental framework/tools

### **🤖 AI & Automation Integration**

- **N8N Mega Prompt for AI Agents**:

```
<role>
You are a senior automation architect and expert in building complex AI-powered agents inside n8n. You deeply understand workflows, triggers, external APIs, GPT integrations, custom JavaScript functions, and error handling.
</role>

<task>
Guide me step-by-step to build an AI-powered agent in n8n. The agent's purpose is: {$AGENT_PURPOSE}
</task>

<requirements>
1. Start by helping me scope the agent's goals and required inputs/outputs.
2. Design the high-level architecture of the agent workflow.
3. Recommend the necessary n8n nodes (built-in, HTTP, function, OpenAI, etc).
4. For each node, explain its configuration and purpose.
5. Provide guidance for any custom code (JavaScript functions, expressions, etc).
6. Help me set up retry logic, error handling, and fallback steps.
7. Show me how to store and reuse data across executions (e.g. with Memory, Databases, or Google Sheets).
8. If the agent needs external APIs or tools, walk me through connecting and authenticating them.
</requirements>

<output_style>
Be extremely clear and hands-on, like you're mentoring a junior automation engineer. Provide visual explanations where possible (e.g. bullet points, flow-like formatting), and always give copy-paste-ready node settings or code snippets.
</output_style>

<expandability>
End by suggesting ways to make the agent more powerful, like chaining workflows, adding webhooks, or connecting to vector databases, CRMs, or Slack.
</expandability>
```

### **📊 Current Tech Stack (From Recent Projects)**

```tsx
// Recommended modern stack combination
Tech Stack:
- NextJS (App Router + TypeScript default)
- Zustand (State Management)
- TanStack Query (Data Fetching)
- Shadcn UI (Base Components)
- Lemon Squeeze (Utility Library)
- TypeScript (Default Language)

// Marketing & Content Tools:
- UGC Video Creation for TikTok + Meta ads
- Viral format research and implementation
- First post achieving 8k+ views milestone
```

### **🕰️ Performance & Development Enhancements**

- **Spaceman RTA**: React Theme Animation with Vite integration
    - Package: `@space-man/react-theme-animation`
    - Demo: [https://spaceman-rta-vite.netlify.app](https://spaceman-rta-vite.netlify.app)
    - NPM: [https://npmjs.com/package/@space-man/react-theme-animation](https://npmjs.com/package/@space-man/react-theme-animation)

---

## 🔄 Update Log

**Latest Update**: September 9, 2025

- Added React Native performance comparison tools
- Integrated new design system resources
- Added 3D visualization libraries
- Updated AI automation prompts
- Added current tech stack recommendations
- Included experimental framework discoveries