Debug a reported bug or error in the Skillify project.

## How to approach debugging

The user will describe an error. Follow these steps:

### 1. Identify the layer
- **"resource not found" / 404 / CastError** → likely a bad ObjectId being sent. Check how the mutation is called — the `enroll` mutation takes a plain string, NOT `{ courseId }`.
- **500 after ~30 seconds** → MongoDB connection issue. Check `server/.env` MONGO_URI — must use standard connection string, not `mongodb+srv://` (SRV DNS is blocked on this network).
- **Dropdown / modal not opening** → Bootstrap JS is NOT loaded. Use React state instead of `data-bs-toggle`.
- **Footer not sticking** → Public pages must wrap their JSX in `<div className="d-flex flex-column min-vh-100">` with `<Footer />` having `mt-auto`.
- **"option X is not supported"** → Extra character in the MongoDB connection string. Remove `?appName=Cluster0` from the URI.

### 2. Read the relevant files
- Server errors → read the controller and route in `server/controllers/` and `server/routes/`
- Client errors → read the page/component and the corresponding service in `client/src/services/`
- Auth errors → read `server/middleware/authMiddleware.js` and `client/src/features/auth/authSlice.js`

### 3. Check the API response shape
All server responses follow: `{ success: true, data: { ... } }`
Client access pattern: `data?.data?.items || data?.data || []`

### 4. Common fixes checklist
- [ ] `enroll(courseId)` not `enroll({ courseId })`
- [ ] Quiz answers format: `[{ questionId, selectedOptionId }]`
- [ ] Question field: `questionText` (not `text`)
- [ ] Bootstrap dropdowns → use React `useState` + `useRef` click-outside
- [ ] `useToast` → use `showToast(msg, variant)` where variant is: `success`, `danger`, `warning`, `info`
- [ ] `StatCard` uses `variant` prop (not `color`)
- [ ] Public pages need `d-flex flex-column min-vh-100` wrapper for sticky footer

### 5. Fix and verify
After making the fix, describe exactly what was wrong and what was changed.
