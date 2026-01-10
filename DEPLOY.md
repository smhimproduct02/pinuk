# Deployment Guide

This project is built with Next.js 16 (Turbopack), Tailwind CSS, Drizzle ORM, and Neon Tech (PostgreSQL).
Follow these steps to deploy it to the web.

## 1. Prerequisites
- **GitHub Account**: Push this code to a new repository.
- **Vercel Account**: For hosting the frontend/backend.
- **Neon Tech Account**: For the PostgreSQL database.

## 2. Database Setup (Neon)
1.  Create a new project in Neon.
2.  Get your connection string (e.g., `postgres://user:pass@ep-xyz.region.aws.neon.tech/neondb?sslmode=require`).
3.  Save this string. You will need it for the `DATABASE_URL` environment variable.

## 3. Vercel Deployment
1.  Go to [Vercel](https://vercel.com) and click "Add New Project".
2.  Import your GitHub repository.
3.  In "Environment Variables", add:
    -   `DATABASE_URL`: (Paste your Neon connection string)
4.  Click "Deploy".

## 4. Database Migration
Once deployed, Vercel will build the app, but the database tables might not exist yet if you haven't run migrations against the *production* DB.

**Option A: Run from Local**
Run this command locally, pointing to your PRODUCTION database url:
```bash
DATABASE_URL="your-prod-connection-string" npx drizzle-kit push
```

**Option B: Add Build Command (Optional)**
You can update `package.json` build script to `npx drizzle-kit push && next build` if you want auto-migrations, but manual is safer for finding errors.

## 5. Verify PWA
After deployment, visit your URL on a mobile device.
1.  Open Safari (iOS) or Chrome (Android).
2.  Tap "Share" -> "Add to Home Screen".
3.  The app should install with the Werewolf icon and launch in full-screen mode.

## 6. Admin Access
Navigate to `/admin` and use the passcode `068538` (or change this in `src/app/admin/page.tsx` before deploying).
