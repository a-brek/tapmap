---
description: Review recent changes and session context for this MapTap session
allowed-tools: Bash(find:*), Read, Glob
---

# /retro — MapTap Session Retrospective

You are reviewing the current state of the MapTap project to give a helpful summary of recent work and what's worth paying attention to.

## Step 1: Gather Context

Read the session memory and key source files:

- Memory file: `~/.claude/projects/C--Users-hanna-Documents-maptap/memory/MEMORY.md`
- Project root files: `package.json`

Find recently modified source files (excluding node_modules):
!`find C:/Users/hanna/Documents/maptap -not -path "*/node_modules/*" -not -path "*/.claude/*" -not -path "*/data/*.db*" -newer C:/Users/hanna/Documents/maptap/package.json -type f 2>/dev/null | head -30`

Current date/time:
!`date`

## Step 2: Read Recent Changes

For each recently modified file found above (limit to source files: .js, .html, .css, .json excluding node_modules), read its contents to understand what changed.

Also read these key files for full context:
- `server/index.js`
- `server/routes/puzzle.js`
- `client/main.js`
- `client/index.html`

## Step 3: Produce a Retro Summary

Output a concise session retrospective in this format:

---

### MapTap Retro

**Recently touched files:**
- List each modified file with a one-line description of what it contains/does

**What appears to have been worked on:**
- Summarize the changes you observed in a few bullet points

**Current state of key systems:**
- Auth: [status based on code]
- Game logic: [status]
- Database: [any pending schema or query concerns]
- Frontend: [any incomplete UI or known issues in code]

**Things to follow up on:**
- Flag any TODOs, commented-out code, half-finished features, or inconsistencies you noticed
- Highlight anything that looks like it could break

**Suggested next steps:**
- 2-3 concrete suggestions based on what you see in the code

---

Be specific and grounded in what you actually read. Don't make things up.
