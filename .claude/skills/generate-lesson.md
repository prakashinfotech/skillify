---
name: generate-lesson
description: Generate a complete lesson object for a Skillify course — structured content, learning objectives, and a matching Mongoose document ready to seed or POST. Also generates the React LessonContent-compatible HTML.
---

Generate a complete lesson for a Skillify course.

## What to ask me for

You'll need:
- **Topic** — e.g. "Introduction to Photosynthesis"
- **Course category** — Mathematics, Science, History, Computer Science, Language Arts, Economics, Arts
- **Level** — Beginner | Intermediate | Advanced
- **Duration** — estimated minutes (default 20)

## Output — two parts

### Part 1: Mongoose document (for seed.js or POST /api/v1/lessons)

```json
{
  "title": "string",
  "content": "<html>rich content here</html>",
  "videoUrl": "",
  "duration": 20,
  "order": 1
}
```

### Part 2: Rich HTML content block

The `content` field must be valid HTML rendered by `LessonContent.jsx`. Structure:

```html
<div>
  <h2>Learning Objectives</h2>
  <ul>
    <li>Objective 1</li>
    <li>Objective 2</li>
    <li>Objective 3</li>
  </ul>

  <h2>Introduction</h2>
  <p>...</p>

  <h2>Core Concepts</h2>
  <h3>Concept 1</h3>
  <p>...</p>
  <pre><code>// code examples if applicable</code></pre>

  <h2>Key Takeaways</h2>
  <ul>
    <li>...</li>
  </ul>

  <h2>Practice Exercise</h2>
  <p>...</p>
</div>
```

## Rules
- Content must be substantive — minimum 400 words of educational value
- Use `<pre><code>` blocks for any code samples
- No inline styles — Bootstrap classes only
- `order` starts at 1 unless user specifies
- After generating, show the API command:
  ```bash
  curl -X POST http://localhost:5000/api/v1/lessons \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{ "course": "<courseId>", ...lessonJson }'
  ```

## Steps

1. Confirm topic, category, level, and duration with the user
2. Generate the full lesson JSON
3. Validate HTML structure (objectives, intro, concepts, takeaways, exercise)
4. Output the complete lesson document
