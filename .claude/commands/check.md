Check the current state of the Skillify project — what's built, what's missing, and if there are any obvious issues.

## Steps

1. **List all page files** to see what's been created:
```
client/src/pages/**/*.jsx
```

2. **List all component files**:
```
client/src/components/**/*.jsx
```

3. **Check server controllers** — make sure all 8 exist:
```
server/controllers/
```

4. **Compare against the expected routes** from `client/src/constants/routes.js` and check that every route has a corresponding page component and is wired in `client/src/App.jsx`.

5. **Check for common prop mismatches** by grepping for known patterns:
   - `enroll({ courseId })` → should be `enroll(courseId)` 
   - `data-bs-toggle` → should be replaced with React state
   - `<>` wrapper with Footer → should be `<div className="d-flex flex-column min-vh-100">`

6. **Report a summary** in this format:
   - ✅ Built: list of completed pages/components
   - ❌ Missing: anything not yet created
   - ⚠️ Issues found: any prop mismatches or patterns to fix

Keep the report concise — one line per item.
