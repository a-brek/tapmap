---
description: Start the MapTap dev server or check what's running
allowed-tools: Bash(npm:*), Bash(node:*), Bash(npx:*), Bash(netstat:*), Bash(curl:*)
---

# /build — Start MapTap Dev Server

$ARGUMENTS

## What to do

If `$ARGUMENTS` is empty or "dev" — start the development server with nodemon:

Check if something is already on port 3001:
!`netstat -ano 2>/dev/null | grep :3001 | head -5 || echo "Port 3001 is free"`

Then run:
```bash
cd C:/Users/hanna/Documents/maptap && npm run dev
```

If `$ARGUMENTS` is "start" — run production mode:
```bash
cd C:/Users/hanna/Documents/maptap && npm start
```

If `$ARGUMENTS` is "check" — just verify the project is ready to run without starting it:

1. Check for .env file
2. Check node_modules exists
3. Check server/index.js syntax: `node --check server/index.js`
4. Report what scripts are available from package.json
5. Say what command to run to start

If `$ARGUMENTS` is "stop" — find and kill what's on port 3001:
!`netstat -ano 2>/dev/null | grep :3001`
Then use the PID found to kill the process.

## Notes
- Dev server runs on http://localhost:3001
- nodemon auto-restarts on file changes (server files only — client files are served statically)
- Frontend changes don't require restart, just browser refresh
