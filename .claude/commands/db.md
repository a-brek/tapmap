---
description: Database helper for MapTap — query Neon, check schema, debug DB issues
allowed-tools: Bash(node:*), Bash(npx:*), Read
---

# /db — MapTap Database Helper

$ARGUMENTS

## What this command does

Helps you work with the MapTap Neon PostgreSQL database.

## Step 1: Load DB context

Always read `server/db.js` first to understand the connection setup.

## Based on $ARGUMENTS:

### If "schema" or empty — show current schema
Run a quick schema check:

```bash
cd C:/Users/hanna/Documents/maptap && node -e "
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query(\`
  SELECT table_name, column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position
\`).then(r => { r.rows.forEach(row => console.log(row.table_name, '|', row.column_name, '|', row.data_type, '|', row.is_nullable)); pool.end(); }).catch(e => { console.error(e.message); pool.end(); });
"
```

### If "test" — test the connection
```bash
cd C:/Users/hanna/Documents/maptap && node -e "
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW() as time, current_database() as db')
  .then(r => { console.log('Connected! DB:', r.rows[0].db, '| Time:', r.rows[0].time); pool.end(); })
  .catch(e => { console.error('Connection failed:', e.message); pool.end(); });
"
```

### If "users" — show recent users
```bash
cd C:/Users/hanna/Documents/maptap && node -e "
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT id, email, username, google_id IS NOT NULL as google_auth, created_at FROM users ORDER BY created_at DESC LIMIT 10')
  .then(r => { console.table(r.rows); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
"
```

### If "scores" or "leaderboard" — show recent scores
```bash
cd C:/Users/hanna/Documents/maptap && node -e "
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT u.username, ds.date, ds.total_score FROM daily_scores ds JOIN users u ON u.id = ds.user_id ORDER BY ds.date DESC, ds.total_score DESC LIMIT 20')
  .then(r => { console.table(r.rows); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
"
```

### If "sql <query>" — run a raw SQL query
Extract the SQL from $ARGUMENTS after "sql " and run it via node + pg.
IMPORTANT: Only run SELECT queries unless the user explicitly confirms a write operation.

### For any DB issue described in $ARGUMENTS:
1. Read `server/db.js` and the relevant route file
2. Diagnose the issue
3. Suggest a fix or run a diagnostic query
