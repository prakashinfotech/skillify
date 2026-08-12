---
name: analyze-student
description: Analyze a Skillify student's learning progress by querying the MCP server, then generate a personalized report with insights and recommendations.
---

Analyze a student's learning progress using the Skillify MCP server.

## Steps

1. **Get the student ID** from the user (or ask for name/email to look up)

2. **Query the MCP server** to gather context:

   ```bash
   # Get student progress across all courses
   curl -X POST http://localhost:5000/api/v1/mcp \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "tools/call",
       "params": {
         "name": "get_student_progress",
         "arguments": { "studentId": "<id>" }
       }
     }'

   # Get their enrollments
   curl -X POST http://localhost:5000/api/v1/mcp \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 2,
       "method": "tools/call",
       "params": {
         "name": "get_enrollments",
         "arguments": { "studentId": "<id>" }
       }
     }'
   ```

3. **Analyze the data** and produce a report covering:

   ### Student Progress Report

   **Overview**
   - Enrolled courses: N
   - Completed courses: N
   - Overall completion rate: X%
   - Quiz average score: X%

   **Course-by-Course Breakdown**
   For each enrolled course: lessons completed, quiz results, last activity

   **Strengths**
   - What they're excelling at

   **Areas for Improvement**
   - Where they're struggling or inactive

   **Personalized Recommendations**
   1. Specific action they should take next
   2. Course or lesson to revisit
   3. Encouragement based on their trajectory

4. **Optionally generate a quiz** using `/generate-quiz` for a topic where they scored low

## Notes
- Use the MCP `prompts/get` method with `analyze_student` prompt for a ready-made Claude prompt
- If the MCP server isn't running, fall back to direct DB queries via `npm run seed` outputs
