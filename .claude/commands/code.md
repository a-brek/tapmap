---
description: Context-aware coding mode — loads MapTap project context then tackles your task
allowed-tools: Read, Glob, Grep, Bash(git:*), Bash(node:*)
---

# /code — MapTap Coding Assistant

Your task: $ARGUMENTS

## Step 1: Load Project Context

Before writing any code, load the relevant context for this project.

**Always read:**
- `server/index.js` — express app, middleware, route registration
- `server/db.js` — database pool setup

**Read based on the task in $ARGUMENTS:**

If the task involves the game, globe, or frontend:
- `client/main.js`
- `client/index.html`

If the task involves auth, login, Google OAuth, sessions:
- `server/routes/auth.js`
- `client/auth.js`

If the task involves scores, leaderboard, history:
- `server/routes/score.js`
- `server/routes/leaderboard.js`
- `server/routes/user.js`

If the task involves puzzles, locations, game data:
- `server/routes/puzzle.js`
- `server/data/puzzles.json` (first 20 lines only for structure)

If the task involves the database schema:
- `server/db.js`

## Step 2: Understand Before Changing

After reading the relevant files:
1. Identify the exact files that need to change
2. Check for any existing related code (search with Grep if needed)
3. Note any patterns or conventions already used in the codebase

## Step 3: Execute the Task

Now implement the change for: **$ARGUMENTS**

Follow these MapTap conventions:
- Backend: Express route handlers, async/await with try/catch, JSON responses
- Frontend: Vanilla JS, no build step, IIFE modules (`window.ModuleName = (function(){ ... })()`)
- Database: Use `db.query()` from `server/db.js`, parameterized queries only
- Auth: Check `req.isAuthenticated()` for protected routes
- Client state: Everything game-related lives in the `state` object in `main.js`
- Globe: Use `globe.gl` API — `globe.pointsData()`, `globe.arcsData()`, `globe.labelsData()`, etc.
- Sounds: Use `playTone()` for audio feedback
- No external dependencies for frontend (CDN only, already loaded in index.html)

## Step 4: Verify

After making changes:
- Confirm the logic is correct for the described task
- Check for any obvious bugs or edge cases
- Note any follow-up tasks if needed

If $ARGUMENTS is empty, ask the user what they want to work on.
