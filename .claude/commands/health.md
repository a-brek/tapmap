---
description: Run a health check on the MapTap project — env, deps, config, and code
allowed-tools: Bash(ls:*), Bash(node:*), Bash(npm:*), Bash(cat:*), Read, Glob
---

# /health — MapTap Project Health Check

Run a full health check on the MapTap project. Check each area in order and report status.

## Checks to Run

### 1. Environment

Check if .env file exists:
!`ls -la C:/Users/hanna/Documents/maptap/.env 2>/dev/null && echo "EXISTS" || echo "MISSING"`

Check which env vars are set (without showing values):
!`node -e "require('dotenv').config({path:'C:/Users/hanna/Documents/maptap/.env'}); const required=['SESSION_SECRET','DATABASE_URL','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET']; required.forEach(k => console.log(k + ':', process.env[k] ? 'SET' : 'MISSING'));" 2>/dev/null`

### 2. Dependencies

Check node_modules exists and key packages are installed:
!`node -e "const pkgs=['express','passport','passport-local','passport-google-oauth20','express-session','connect-pg-simple','pg','bcryptjs','helmet','compression','dotenv']; pkgs.forEach(p => { try { require('C:/Users/hanna/Documents/maptap/node_modules/'+p); console.log(p+': OK'); } catch(e) { console.log(p+': MISSING'); }})"  2>/dev/null`

### 3. Server Config

Read `server/index.js` and verify:
- Port is set to 3001
- Session middleware is configured
- Passport is initialized
- Static files route points to `client/`
- All route files are imported

### 4. Database

Read `server/db.js` and verify the Neon connection setup looks correct (pg Pool with DATABASE_URL).

Check if the DATABASE_URL looks like a Neon connection string:
!`node -e "require('dotenv').config({path:'C:/Users/hanna/Documents/maptap/.env'}); const url=process.env.DATABASE_URL||''; console.log('DB host:', url.includes('neon.tech') ? 'Neon (OK)' : url ? 'Custom: '+url.split('@')[1]?.split('/')[0] : 'NOT SET');" 2>/dev/null`

### 5. Client Files

Verify all client files exist:
!`ls C:/Users/hanna/Documents/maptap/client/ 2>/dev/null`

Check for any obvious JS syntax errors in main.js:
!`node --check C:/Users/hanna/Documents/maptap/client/main.js 2>&1 && echo "main.js: OK" || echo "main.js: SYNTAX ERROR"`

Check auth.js:
!`node --check C:/Users/hanna/Documents/maptap/client/auth.js 2>&1 && echo "auth.js: OK" || echo "auth.js: SYNTAX ERROR"`

### 6. Data Files

Check puzzle data exists:
!`node -e "const d=require('C:/Users/hanna/Documents/maptap/server/data/puzzles.json'); const keys=Object.keys(d); console.log('Puzzles loaded:', keys.length, 'entries'); console.log('Latest puzzle:', keys.sort().slice(-3).join(', '));" 2>/dev/null`

## Output Format

Present results as a clean status table:

```
MAPTAP HEALTH CHECK
===================
[PASS/FAIL/WARN] Environment — .env file and required vars
[PASS/FAIL/WARN] Dependencies — all npm packages installed
[PASS/FAIL/WARN] Server config — index.js looks correct
[PASS/FAIL/WARN] Database — Neon connection configured
[PASS/FAIL/WARN] Client files — all present, no syntax errors
[PASS/FAIL/WARN] Puzzle data — data loaded

Issues found:
- List any FAIL or WARN items with specific detail
```

If everything passes, say so clearly. If there are issues, explain what to fix.
