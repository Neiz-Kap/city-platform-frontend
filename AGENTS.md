# ODS City Platform - AI Agent Guidelines

## Project Overview

**ODS City Platform** is a fullstack complaint management system that aggregates citizen complaints from multiple sources (Telegram bots, VK groups, email) and provides real-time monitoring and analytics.

### Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS 4
- **State Management**: TanStack Query v5 (React Query)
- **Tables**: TanStack Table v8 with custom data-table implementation
- **Forms**: React Hook Form + Zod validation
- **Real-time**: Socket.io-client for live updates
- **Styling**: Tailwind CSS 4 with custom theming
- **HTTP Client**: ky

### Architecture

```
app/                    # Next.js App Router pages
  dashboard/            # Main dashboard layout
    (guest)/            # Guest layout group
      nlp/              # NLP features
        complaint/      # Complaint pages
        source/         # Source management page

components/             # React components
  data-table/           # Reusable data table components
  entities/             # Entity-specific components
  features/             # Feature-specific components
  layout/               # Layout components
  modals/               # Modal dialogs
  ui/                   # shadcn/ui primitives
  widgets/              # Composite widgets

lib/                    # Library code
  api/                  # API client classes
    source/             # Source-specific APIs
  hooks/                # Custom React hooks
  types/                # TypeScript type definitions
  utils/                # Utility functions
```

### Key Patterns

1. **API Classes**: Use class-based API clients (e.g., `ComplaintAPI`, `VkApi`)
2. **Custom Hooks**: Encapsulate data fetching and mutations (e.g., `useSourceManagement`, `useComplaints`)
3. **Type Safety**: Strict TypeScript with comprehensive type definitions
4. **Component Organization**: Feature-based with entities, features, and widgets layers
5. **Form Handling**: React Hook Form + Zod for validation
6. **Real-time Updates**: Socket.io with optimistic UI updates

### Project Goals

- Provide real-time complaint monitoring from multiple sources
- Enable source management (add/remove/toggle platforms and groups)
- Display statistics and analytics
- Maintain high code quality and type safety
- Ensure responsive and accessible UI

## Development Guidelines

### When Working on Features

1. **Read existing patterns first** - Check similar components/hooks/APIs before creating new ones
2. **Maintain type safety** - Always define proper TypeScript types
3. **Follow file organization** - Place files in appropriate directories (entities, features, widgets)
4. **Use existing utilities** - Leverage data-table, form utilities, and hooks
5. **Implement error handling** - Use try-catch with toast notifications
6. **Optimize performance** - Use memoization, React Query caching, and optimistic updates

### Code Style

- Use functional components with hooks
- Prefer named exports over default exports (except for pages)
- Use `"use client"` directive for client components
- Follow existing naming conventions (PascalCase for components, camelCase for functions)
- Keep components focused and composable
- Extract reusable logic into custom hooks

### Testing Approach

- Test user interactions and workflows
- Verify API integrations
- Check responsive design across devices
- Validate form inputs and error states
- Test real-time updates and socket connections

## Important Notes

- **Backend API**: The backend handles parsing, transformation, and storage
- **Real-time**: Socket.io provides live complaint updates
- **Multi-source**: Support for Telegram, VK, and Email sources
- **Locale**: Russian language UI (ru-RU)
- **Date handling**: Use date-fns with timezone support
