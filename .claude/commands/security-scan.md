---
description: Scan MapTap for security leaks — secrets, private keys, hardcoded credentials, exposed env vars in client code, and .gitignore gaps
allowed-tools: Bash(grep:*), Bash(git:*), Bash(node:*), Bash(ls:*), Read, Glob, Grep
---

# /security-scan — MapTap Security Leak Scanner

Scan the MapTap project for exposed secrets, credentials, and private data. Check each area in order and report findings.

## Checks to Run

### 1. .gitignore Coverage

Verify .env and other sensitive files are ignored:
!`grep -E "^\.env|^\.env\." C:/Users/hanna/Documents/maptap/.gitignore 2>/dev/null && echo "✓ .env in .gitignore" || echo "✗ .env NOT in .gitignore — CRITICAL"`
!`grep -E "node_modules" C:/Users/hanna/Documents/maptap/.gitignore 2>/dev/null && echo "✓ node_modules in .gitignore" || echo "✗ node_modules NOT in .gitignore"`

### 2. Secrets in Tracked Files (git)

Check if any sensitive files are tracked by git (should never be):
!`git -C C:/Users/hanna/Documents/maptap ls-files | grep -E "^\.env$|^\.env\." 2>/dev/null && echo "✗ CRITICAL: .env is tracked by git!" || echo "✓ .env not tracked by git"`
!`git -C C:/Users/hanna/Documents/maptap ls-files | grep -E "private_key|secret|credential|id_rsa|\.pem$|\.key$" 2>/dev/null && echo "✗ Suspicious files tracked!" || echo "✓ No suspicious filenames tracked"`

### 3. Secret Patterns in Source Files

Scan all non-ignored source files for common secret patterns:
!`grep -rn --include="*.js" --include="*.json" --include="*.ts" --include="*.env*" --include="*.md" --exclude-dir=node_modules --exclude-dir=.git -E "(api_key|apikey|api_secret|access_token|secret_key|private_key|password\s*=\s*['\"][^'\"]{4,}|GOOGLE_CLIENT_SECRET|SESSION_SECRET)\s*[:=]\s*['\"][A-Za-z0-9+/=_\-]{8,}" C:/Users/hanna/Documents/maptap/ 2>/dev/null | grep -v "\.example" | grep -v "process\.env" | grep -v "your-secret\|your_secret\|changeme\|placeholder\|<your\|CHANGE_ME" && echo "✗ Possible secrets found above!" || echo "✓ No hardcoded secret values found"`

### 4. Hardcoded Connection Strings / URLs with Credentials

Check for database URLs or connection strings with embedded passwords:
!`grep -rn --include="*.js" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.git -E "postgres(ql)?://[^:]+:[^@]+@|mysql://[^:]+:[^@]+@|mongodb\+srv://[^:]+:[^@]+@" C:/Users/hanna/Documents/maptap/ 2>/dev/null | grep -v "process\.env\|\.example\|PLACEHOLDER" && echo "✗ Hardcoded DB credentials found!" || echo "✓ No hardcoded DB connection strings"`

### 5. Exposed Secrets in Client-Side Code

Client JS runs in the browser — nothing secret should be there. Scan client/:
!`grep -n --include="*.js" --include="*.html" -E "(DATABASE_URL|SESSION_SECRET|GOOGLE_CLIENT_SECRET|password_hash|private_key|SECRET)" C:/Users/hanna/Documents/maptap/client/*.js C:/Users/hanna/Documents/maptap/client/*.html 2>/dev/null && echo "✗ Sensitive names found in client code!" || echo "✓ No obvious secrets exposed in client files"`

Check for any process.env usage in client JS (would be undefined in browser, likely a mistake):
!`grep -n "process\.env\." C:/Users/hanna/Documents/maptap/client/*.js 2>/dev/null && echo "✗ process.env used in client JS (will be undefined in browser)" || echo "✓ No process.env in client code"`

### 6. AWS / Cloud Provider Key Patterns

Scan for AWS, Stripe, Twilio, and other vendor key formats:
!`grep -rn --include="*.js" --include="*.ts" --include="*.json" --include="*.md" --exclude-dir=node_modules --exclude-dir=.git -E "(AKIA[0-9A-Z]{16}|sk_live_[0-9a-zA-Z]{24,}|sk_test_[0-9a-zA-Z]{24,}|AC[a-z0-9]{32}|[0-9a-f]{32}-us[0-9]{1,2})" C:/Users/hanna/Documents/maptap/ 2>/dev/null && echo "✗ Vendor API key pattern found!" || echo "✓ No AWS/Stripe/Twilio key patterns found"`

### 7. Private Key Blocks

Scan for PEM-encoded private keys or certificates:
!`grep -rn --exclude-dir=node_modules --exclude-dir=.git -l "BEGIN PRIVATE KEY\|BEGIN RSA PRIVATE KEY\|BEGIN EC PRIVATE KEY\|BEGIN CERTIFICATE" C:/Users/hanna/Documents/maptap/ 2>/dev/null && echo "✗ PEM private key/cert found in above files!" || echo "✓ No PEM private keys found"`

### 8. Git History — Secrets Ever Committed

Check if .env was ever committed in git history (even if removed):
!`git -C C:/Users/hanna/Documents/maptap log --all --full-history -- ".env" 2>/dev/null | head -5 | grep -q "commit" && echo "✗ WARNING: .env appears in git history — secrets may be exposed. Run: git filter-repo or BFG to clean." || echo "✓ .env never appeared in git history"`

Check for secret-looking strings in all commits (last 50):
!`git -C C:/Users/hanna/Documents/maptap log --all -50 --pretty="%H" 2>/dev/null | xargs -I{} git -C C:/Users/hanna/Documents/maptap diff-tree --no-commit-id -r --name-only {} 2>/dev/null | sort -u | grep -E "\.env$|private_key|\.pem$|\.key$|credential" && echo "✗ Suspicious files in recent git history!" || echo "✓ No suspicious files in recent commits"`

### 9. .env.example Safety Check

Verify .env.example doesn't contain real values:
!`node -e "const fs=require('fs'); const f='C:/Users/hanna/Documents/maptap/.env.example'; if(!fs.existsSync(f)){console.log('WARN: No .env.example found');process.exit(0);} const c=fs.readFileSync(f,'utf8'); const lines=c.split('\n').filter(l=>l.includes('=')); const suspiciousLines=lines.filter(l=>{ const val=(l.split('=')[1]||'').trim(); return val.length>20 && !val.startsWith('your_') && !val.startsWith('change') && !val.includes('example') && !val.startsWith('<') && val!==''; }); if(suspiciousLines.length){console.log('✗ .env.example may contain real values:\n'+suspiciousLines.join('\n'));}else{console.log('✓ .env.example looks safe (placeholder values only)');}" 2>/dev/null`

## Output Format

Present results as a clean status table:

```
MAPTAP SECURITY SCAN
====================
[PASS/FAIL/WARN] .gitignore       — .env and sensitive files excluded
[PASS/FAIL/WARN] Git tracking     — no secrets tracked or in history
[PASS/FAIL/WARN] Source files     — no hardcoded secret values
[PASS/FAIL/WARN] DB credentials   — no embedded connection string passwords
[PASS/FAIL/WARN] Client exposure  — no secrets in browser-side code
[PASS/FAIL/WARN] Vendor keys      — no AWS/Stripe/cloud API keys
[PASS/FAIL/WARN] Private keys     — no PEM keys or certificates
[PASS/FAIL/WARN] Git history      — .env never committed
[PASS/FAIL/WARN] .env.example     — only placeholder values

Findings:
- List every FAIL or WARN with file:line references where possible
- Suggest remediation for each issue
```

If all checks pass, confirm the project is clean. If issues are found, prioritize CRITICAL (committed secrets, tracked .env) over WARN (patterns that need manual review).
