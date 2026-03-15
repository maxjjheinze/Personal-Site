# Max in Progress - Personal Website

## Overview
Single-screen personal brand landing page for Max Heinze (@MaxInProgress). Features a solar system avatar with orbiting planet pills, pixel intro animation, and activity ticker.

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 3
- Framer Motion 11
- Deployed on Vercel

## Project Structure
- `app/` - Next.js App Router pages and layouts
- `components/hero/` - Hero section: HeroText, AvatarSection, AnimatedGrid, AmbientParticles
- `components/intro/` - PixelIntro (particle assembly animation on page load)
- `hooks/` - Custom React hooks (useMousePosition)
- `lib/` - Utility functions and constants
- `public/` - Static assets (profile.png)

## Key Components
- **PixelIntro** - Canvas-based particle animation that assembles into a snapshot of the hero, then fades to reveal the real page. Uses pixel-scanning for glyph alignment between different font sizes.
- **HeroText** - Title "MAX IN PROGRESS" + activity ticker cycling 3 messages
- **AvatarSection** - Profile photo with orbiting planet pills (Connect, About Me, Projects), modals, magnetic cursor pull, breathing animation
- **AnimatedGrid** - Line grid background with radial fade near avatar + animated gradient blobs
- **AmbientParticles** - Grid intersection glow effect on cursor hover, excluded from solar system zone

## Conventions
- Use `"use client"` only when needed (Framer Motion, hooks, event handlers)
- Use path alias `@/` for imports
- Component files use PascalCase
- Use Space Grotesk for display/headings, Inter for body text, Space Mono for mono
- All colors use CSS custom properties via HSL pattern: `hsl(var(--token))`
- Animations use Framer Motion where possible
- Default browser cursor (no custom cursor)

## Design System
- Dark theme only (no light mode, `color-scheme: dark`)
- Primary accent: blue (#4F7BF7)
- Secondary accent: purple (#8B5CF6)
- Background: dark charcoal (#101014)
- Noise texture overlay on body::before
- See `app/globals.css` for full color token definitions

## Current Status
- Single-screen landing page (no scrolling sections)
- Title + activity ticker (Melbourne/date+time/@MaxInProgress)
- Solar system avatar with 3 orbit pills and modals
- Grid glow effect excluded from solar system area
- Pixel intro animation with glyph-aligned text
- Accessibility: single h1, button pills, aria-labels, escape dismiss, skip link

## Known Issues
- PixelIntro canvas text alignment uses pixel-scanning technique because canvas sans-serif font has different glyph bearing than Space Grotesk — any changes to title font size require the pixel-scan to recalibrate automatically (it does)
- Title h1 has `marginLeft: -0.07em` to compensate for Space Grotesk tracking-tighter glyph bearing

## Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint (not configured yet)
