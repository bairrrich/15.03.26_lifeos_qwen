# LifeOS System Architecture

```mermaid
graph TB
    %% User Interface Layer
    subgraph "UI Layer"
        A[Next.js App Router]
        B[React Components]
        C[shadcn/ui Components]
        D[Tailwind CSS]
    end

    %% Application Layer
    subgraph "Application Layer"
        E[Zustand Store]
        F[React Query]
        G[Custom Hooks]
        H[Form Handling]
    end

    %% Business Logic Layer
    subgraph "Business Logic"
        I[Finance Module]
        J[Nutrition Module]
        K[Workouts Module]
        L[Habits Module]
        M[Goals Module]
        N[Health Module]
        O[Mind Module]
        P[Beauty Module]
        Q[Automations Module]
    end

    %% Data Access Layer
    subgraph "Data Access"
        R[Dexie.js<br/>IndexedDB]
        S[Supabase Client]
        T[API Routes]
        U[Sync Service]
    end

    %% External Services
    subgraph "External Services"
        V[Supabase<br/>PostgreSQL]
        W[Authentication]
        X[Real-time Sync]
    end

    %% Infrastructure
    subgraph "Infrastructure"
        Y[PWA Service Worker]
        Z[Manifest]
        AA[Offline Support]
    end

    %% Connections
    A --> B
    B --> C
    C --> D

    A --> E
    A --> F
    A --> G
    A --> H

    E --> I
    E --> J
    E --> K
    E --> L
    E --> M
    E --> N
    E --> O
    E --> P
    E --> Q

    I --> R
    J --> R
    K --> R
    L --> R
    M --> R
    N --> R
    O --> R
    P --> R
    Q --> R

    R --> T
    S --> T
    T --> U

    U --> V
    V --> W
    V --> X

    A --> Y
    Y --> Z
    Y --> AA

    %% Styling
    classDef ui fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef app fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef business fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef infra fill:#f9fbe7,stroke:#827717,stroke-width:2px

    class A,B,C,D ui
    class E,F,G,H app
    class I,J,K,L,M,N,O,P,Q business
    class R,S,T,U data
    class V,W,X external
    class Y,Z,AA infra
```

## Architecture Overview

### UI Layer
- **Next.js App Router**: Handles routing and server-side rendering
- **React Components**: Modular component architecture
- **shadcn/ui**: Consistent design system components
- **Tailwind CSS**: Utility-first styling with OKLCH colors

### Application Layer
- **Zustand**: Global state management for UI state
- **React Query**: Server state management and caching
- **Custom Hooks**: Business logic encapsulation
- **Form Handling**: React Hook Form with Zod validation

### Business Logic Layer
Eight specialized modules handling different life domains:
- Finance: Transactions, budgets, investments
- Nutrition: Food tracking, recipes, macros
- Workouts: Programs, exercises, progress
- Habits: Streaks, completions, analytics
- Goals: Long-term objectives, progress tracking
- Health: Metrics, sleep, vital signs
- Mind: Books, courses, learning materials
- Beauty: Routines, products, skincare
- Automations: Rule-based triggers and actions

### Data Access Layer
- **Dexie.js**: Local IndexedDB for offline functionality
- **Supabase Client**: Remote PostgreSQL access
- **API Routes**: Next.js API endpoints
- **Sync Service**: Bidirectional data synchronization

### External Services
- **Supabase**: Backend-as-a-Service providing database, auth, and real-time features
- **Authentication**: User management and security
- **Real-time Sync**: Live data synchronization across devices

### Infrastructure
- **PWA**: Progressive Web App capabilities
- **Service Worker**: Offline support and caching
- **Manifest**: App installation and metadata