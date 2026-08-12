---
name: scaffold
description: Scaffold a new backend controller+route+validator or a new frontend page+service combo following Skillify's exact conventions. Generates all boilerplate, wired and ready to run.
---

Scaffold a new Skillify module following project conventions.

## Usage

Tell me what to scaffold:
- `backend <ResourceName>` — creates controller, route file, and validator
- `frontend <PageName> <role>` — creates RTK Query service + page component
- `full <ResourceName>` — creates both backend and frontend together

## Backend scaffold — `backend <Resource>`

### Files generated:

**`server/controllers/<resource>Controller.js`**
```js
const <Resource> = require('../models/<Resource>')
const asyncHandler = require('../utils/asyncHandler')
const { success, error } = require('../utils/apiResponse')

const getAll = asyncHandler(async (req, res) => {
  const items = await <Resource>.find()
  return success(res, { <resources>: items })
})

const getById = asyncHandler(async (req, res) => {
  const item = await <Resource>.findById(req.params.id)
  if (!item) return error(res, '<Resource> not found', 404)
  return success(res, { <resource>: item })
})

const create = asyncHandler(async (req, res) => {
  const item = await <Resource>.create(req.body)
  return success(res, { <resource>: item }, '<Resource> created', 201)
})

const update = asyncHandler(async (req, res) => {
  const item = await <Resource>.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!item) return error(res, '<Resource> not found', 404)
  return success(res, { <resource>: item }, '<Resource> updated')
})

const remove = asyncHandler(async (req, res) => {
  await <Resource>.findByIdAndDelete(req.params.id)
  return success(res, {}, '<Resource> deleted')
})

module.exports = { getAll, getById, create, update, remove }
```

**`server/routes/<resource>Routes.js`** — follows courseRoutes.js pattern with verifyAccessToken + authorize middleware

**Add to `server/server.js`:**
```js
const <resource>Routes = require('./routes/<resource>Routes')
app.use('/api/v1/<resources>', <resource>Routes)
```

## Frontend scaffold — `frontend <Page> <role>`

### Files generated:

**`client/src/services/<resource>Api.js`** — RTK Query with standard CRUD endpoints, tagTypes, and exported hooks

**`client/src/pages/<role>/<Page>.jsx`** — Full page using:
- `useGet<Resource>sQuery` from the service
- `Loader`, `EmptyState`, `Pagination`, `SearchBar` from common components
- `showToast` from `useToast`
- Bootstrap 5 grid layout

**Update instructions:**
1. Add route to `client/src/App.jsx`
2. Add constant to `client/src/constants/routes.js`
3. Register API in `client/src/app/store.js`
4. Add nav item to `Sidebar.jsx` if needed

## Rules
- ALWAYS use `asyncHandler` wrapper in controllers
- ALWAYS use `success()`/`error()` from `apiResponse.js` — never `res.json()` directly
- Frontend RTK Query: include `providesTags` on queries, `invalidatesTags` on mutations
- Use `data?.data?.items || data?.data || []` pattern for RTK Query data access
- Never use `data-bs-toggle` — use React state for interactive elements

## Steps

1. Identify the resource name and role from the user's request
2. Generate all files with proper naming (camelCase controllers, PascalCase components)
3. Output each file in a separate code block with the full path as the title
4. List the manual wiring steps at the end
