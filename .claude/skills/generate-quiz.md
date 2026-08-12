---
name: generate-quiz
description: Generate a complete, ready-to-seed quiz for a Skillify course using Claude. Outputs a quiz object that matches the Mongoose Quiz schema and can be pasted directly into seed/seed.js or POST'd to /api/v1/quizzes.
---

Generate a complete multiple-choice quiz for Skillify.

## What to ask me for

You'll need:
- **Topic** — e.g. "Python list comprehensions", "Newton's laws", "World War I causes"
- **Course category** — one of: Mathematics, Science, History, Computer Science, Language Arts, Economics, Arts
- **Difficulty** — Beginner | Intermediate | Advanced
- **Number of questions** — default 5

## Output format

Produce a JSON object that exactly matches the Skillify Quiz Mongoose schema:

```json
{
  "title": "string",
  "description": "string",
  "passingScore": 70,
  "questions": [
    {
      "questionText": "string",
      "options": [
        { "id": "a", "text": "string", "isCorrect": false },
        { "id": "b", "text": "string", "isCorrect": true },
        { "id": "c", "text": "string", "isCorrect": false },
        { "id": "d", "text": "string", "isCorrect": false }
      ],
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}
```

## Rules
- Exactly ONE option per question must have `"isCorrect": true`
- Option ids must be `"a"`, `"b"`, `"c"`, `"d"` in order
- `explanation` field is required — explain WHY the answer is correct
- `passingScore` defaults to 70 unless the user specifies otherwise
- All questions must be clearly worded and unambiguous
- Distractors (wrong answers) must be plausible, not obviously wrong
- After generating the JSON, show the curl command to POST it to the API:
  ```bash
  curl -X POST http://localhost:5000/api/v1/quizzes \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{ "course": "<courseId>", ...quizJson }'
  ```

## Steps

1. Ask the user for topic, category, difficulty, and question count if not provided
2. Generate the quiz JSON following the schema above
3. Validate: check each question has exactly one correct option, all 4 options present
4. Output the ready-to-use JSON block
5. Optionally show how to import it in `seed/seed.js`
