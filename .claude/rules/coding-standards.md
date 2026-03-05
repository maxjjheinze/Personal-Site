# Coding Standards

## TypeScript
- Use strict mode, no `any` types
- Prefer `interface` over `type` for object shapes
- Use named exports for components

## React / Next.js
- Use functional components only
- Mark client components with `"use client"` at the top
- Use Next.js `<Image>` for all images
- Use `@/` path alias for all imports

## Styling
- Use Tailwind utility classes
- Use design tokens from CSS custom properties (e.g., `bg-background`, `text-accent`)
- Avoid inline styles except for dynamic values (e.g., Framer Motion `style` prop)

## Animations
- Use Framer Motion for all animations
- Respect `prefers-reduced-motion` where possible
- Use spring physics for interactive animations, easing for entrance animations
