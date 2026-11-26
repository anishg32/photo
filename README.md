# MJ PHOTOGRAPHY

> **"EVERY FRAME TELLS A STORY."**

A luxury 3D immersive photography portfolio and studio management platform built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **Three.js / React Three Fiber / Drei**, **GSAP + ScrollTrigger**, **Framer Motion**, **Lenis**, and **Google Firebase**.

## Key Features

- **Cinematic 3D Hero & Virtual Museum Pavilion**: Real-time Three.js floating photography plates, particle atmosphere, guided & free-orbit 3D exhibition gallery, automatic off-screen pause, mobile LOD scaling, and a full 2.5D fallback when WebGL is unavailable.
- **Editorial Showcase Across 10 Disciplines**: Dedicated dynamic routes for Wedding, Portrait, Nature, Landscape, Travel, Fashion, Events, Street, Product, and Wildlife photography (`/categories/[slug]`).
- **Dynamic Masonry Gallery & Native Lightbox**: Search, category filtering, pagination, zoom, keyboard arrow navigation (`←` / `→` / `Esc`), and full-screen `<dialog>` modal containment.
- **Visual Stories & Studio Services**: Long-form photographic essays (`/stories/[slug]`) and bespoke service offerings (`/services`) with optional admin-configured pricing.
- **Authentic Testimonials & Validated Bookings**: Client reflections appear only after administrator approval; booking enquiries are validated via Zod, rate-limited, App-Check aware, and persisted securely via Firebase Admin SDK (`/api/bookings`).
- **Protected Studio Admin Dashboard (`/admin`)**:
  - Server-verified Firebase Auth custom claims (`admin === true`) & `HttpOnly` session cookies.
  - High-resolution image uploads preserving untouched original photography masters in `/gallery/`, `/categories/`, `/stories/` while generating separate WebP display thumbnails in `/thumbnails/` using `sharp`.
  - Full CRUD for Gallery, Categories, Bookings (status workflow), Stories, Testimonials (moderation), and Website Settings.

## Local Development

```bash
cp .env.example .env.local
# Populate your Firebase client + server environment variables (or enable emulators)
npm install
npm run dev
```

## Verification Scripts

```bash
npm run test       # Run Vitest validation, rate-limit & security architecture suite
npm run typecheck  # TypeScript check
npm run lint       # ESLint check
npm run build      # Production Next.js build
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Firebase & Vercel production deployment steps.
