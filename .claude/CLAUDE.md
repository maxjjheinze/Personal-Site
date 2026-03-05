# Max in Progress - Personal Website

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 3
- Framer Motion 11
- Deployed on Vercel

## Project Structure
- `app/` - Next.js App Router pages and layouts
- `components/` - React components organized by feature
- `components/hero/` - Hero section sub-components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and constants
- `public/` - Static assets (profile.png)

## Conventions
- Use `"use client"` only when needed (Framer Motion, hooks, event handlers)
- Use path alias `@/` for imports
- Component files use PascalCase
- Use Space Grotesk for display/headings, Inter for body text
- All colors use CSS custom properties via HSL pattern: `hsl(var(--token))`
- Animations use Framer Motion where possible

## Design System
- Dark theme only (no light mode)
- Primary accent: blue (#4F7BF7)
- Secondary accent: purple (#8B5CF6)
- Background: dark charcoal (#101014)
- See `app/globals.css` for full color token definitions

## Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
