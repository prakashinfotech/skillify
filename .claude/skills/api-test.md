---
name: api-test
description: Smoke-test all Skillify API endpoints end-to-end — auth, courses, lessons, quizzes, enrollments, progress, and the MCP server. Reports what passes and what fails.
---

Run a full API smoke test against the running Skillify backend.

## Prerequisites
- Backend running on http://localhost:5000
- Seeded database (`npm run seed` in /server)

## Steps

### 1 — Health check
```bash
curl -s http://localhost:5000/api/v1/health | jq .
```
Expected: `{ "success": true, "message": "API is running" }`

### 2 — Auth flow
```bash
# Login as student
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@skillify.com","password":"Student@123"}' \
  | jq -r '.data.accessToken')
echo "Student token: $TOKEN"

# Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skillify.com","password":"Admin@123"}' \
  | jq -r '.data.accessToken')
```

### 3 — Public course catalog
```bash
curl -s "http://localhost:5000/api/v1/courses?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.total'
```

### 4 — MCP server
```bash
# Initialize
curl -s -X POST http://localhost:5000/api/v1/mcp \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | jq .

# List tools
curl -s -X POST http://localhost:5000/api/v1/mcp \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | jq '.result.tools[].name'

# Call analytics tool
curl -s -X POST http://localhost:5000/api/v1/mcp \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_analytics_summary","arguments":{}}}' | jq .
```

### 5 — Enrollment + progress
```bash
COURSE_ID=$(curl -s "http://localhost:5000/api/v1/courses" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data.courses[0]._id')

curl -s -X POST http://localhost:5000/api/v1/enrollments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\": \"$COURSE_ID\"}" | jq .
```

## Report format

After running all checks, output a table:

| Endpoint | Status | Notes |
|----------|--------|-------|
| GET /health | ✅ Pass | |
| POST /auth/login | ✅ Pass | Token obtained |
| GET /courses | ✅ Pass | N courses returned |
| POST /mcp initialize | ✅ Pass | |
| POST /mcp tools/list | ✅ Pass | N tools available |
| ... | | |

List any failures with the actual error response received.
