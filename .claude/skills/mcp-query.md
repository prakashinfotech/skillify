---
name: mcp-query
description: Query the Skillify MCP server to get live data — courses, users, analytics, student progress, quiz results. Formats the response for readability. Requires the backend to be running.
---

Query the Skillify MCP server for live data.

## Available tools (call with `tools/call`)

| Tool | Required args | Description |
|------|--------------|-------------|
| `get_courses` | — | List approved courses, filter by category/level/search |
| `get_course_detail` | `courseId` | Full course with lessons and quizzes |
| `get_users` | — | Admin-only: list users, filter by role |
| `get_enrollments` | — | Filter by student, course, or status |
| `get_student_progress` | `studentId` | Detailed progress per course |
| `get_analytics_summary` | — | Platform-wide KPIs |
| `get_quiz_results` | — | Quiz attempts, filter by student/quiz/passed |
| `search_content` | `query` | Full-text search across courses/lessons/quizzes |

## How to call

### Initialize first (once per session)
```bash
curl -s -X POST http://localhost:5000/api/v1/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":0,"method":"initialize","params":{}}'
```

### List all tools
```bash
curl -s -X POST http://localhost:5000/api/v1/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

### Call a specific tool
```bash
curl -s -X POST http://localhost:5000/api/v1/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "<tool_name>",
      "arguments": { <args> }
    }
  }'
```

### Read a resource
```bash
# Available URIs: skillify://analytics/summary, skillify://courses/catalog
curl -s -X POST http://localhost:5000/api/v1/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "resources/read",
    "params": { "uri": "skillify://analytics/summary" }
  }'
```

### Get a prompt (AI-ready)
```bash
# Available: analyze_student, course_recommendation, quiz_question_generator, lesson_outline_generator
curl -s -X POST http://localhost:5000/api/v1/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "prompts/get",
    "params": {
      "name": "quiz_question_generator",
      "arguments": { "topic": "Python basics", "difficulty": "beginner", "count": "5" }
    }
  }'
```

## Steps

1. Ask the user what data they want (if not specified)
2. Determine which tool(s) to use from the table above
3. Execute the curl commands
4. Parse the response and present the data in a readable format (table or bullet list)
5. If the user wants to act on the data (e.g., fix an enrollment issue), use `/debug` or directly propose code changes

## Notes
- Get a token: `npm run seed` seeds 3 test accounts (see CLAUDE.md for credentials)
- Admin token required for `get_users`
- MCP_SECRET header can be used instead of Bearer token: `-H "x-mcp-secret: <MCP_SECRET>"`
