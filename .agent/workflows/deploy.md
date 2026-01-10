---
description: Build Verification Workflow
---
# Build Verification Workflow

To ensure Vercel deployments succeed, follow these steps before pushing to `main`.

1. **Load Environment Variables**: Ensure you have the `DATABASE_URL` (and other secrets) available.
   - You can `cat .env` to see them.
2. **Run Build Locally**:
   ```bash
   export DATABASE_URL="<your_postgres_url>"
   npm run build
   ```
3. **Analyze Output**:
   - If the build fails, fix the reported errors (TypeScript, ESLint, etc.).
   - If the build succeeds (Exit code: 0), proceed to push.

// turbo
4. **Push to Git**:
   ```bash
   git push origin main
   ```
