/**
 * Skillify MCP Server
 *
 * Implements the Model Context Protocol (JSON-RPC 2.0 over HTTP).
 * Exposes Skillify database data as callable tools that AI models can use.
 *
 * Transport: HTTP POST at /api/v1/mcp
 * Auth: Bearer token (same JWT as rest of API) OR a shared MCP_SECRET env var
 *
 * Protocol reference: https://modelcontextprotocol.io/specification
 */

const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { TOOLS } = require('./tools')
const { HANDLERS } = require('./handlers')

const router = express.Router()

// ---------------------------------------------------------------------------
// Auth: accept either a user JWT or a shared MCP_SECRET header
// ---------------------------------------------------------------------------
async function mcpAuth(req, res, next) {
  // Allow shared secret for server-to-server MCP clients
  const secret = req.headers['x-mcp-secret']
  if (secret && secret === process.env.MCP_SECRET) {
    req.mcpUser = { role: 'admin', name: 'MCP Client' }
    return next()
  }

  // Fall back to user JWT
  const auth = req.headers.authorization
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('name role isActive')
      if (user && user.isActive) {
        req.mcpUser = user
        return next()
      }
    } catch (_) {}
  }

  // Unauthenticated — still allow read-only tools in dev mode
  if (process.env.NODE_ENV !== 'production') {
    req.mcpUser = { role: 'guest', name: 'Anonymous' }
    return next()
  }

  return res.status(401).json(rpcError(null, -32001, 'Unauthorized'))
}

// ---------------------------------------------------------------------------
// JSON-RPC 2.0 helpers
// ---------------------------------------------------------------------------
const rpcSuccess = (id, result) => ({ jsonrpc: '2.0', id, result })
const rpcError = (id, code, message, data) => ({
  jsonrpc: '2.0',
  id,
  error: { code, message, ...(data ? { data } : {}) },
})

// ---------------------------------------------------------------------------
// MCP Method Dispatch
// ---------------------------------------------------------------------------
async function dispatch(method, params, user) {
  switch (method) {
    // --- Lifecycle ---
    case 'initialize':
      return {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {}, resources: { subscribe: false }, prompts: {} },
        serverInfo: {
          name: 'skillify-mcp',
          version: '1.0.0',
          description: 'Skillify LMS — MCP server exposing courses, users, and analytics',
        },
      }

    case 'notifications/initialized':
      return {}

    case 'ping':
      return {}

    // --- Tools ---
    case 'tools/list':
      return { tools: TOOLS }

    case 'tools/call': {
      const { name, arguments: args = {} } = params
      const handler = HANDLERS[name]
      if (!handler) {
        throw { code: -32602, message: `Unknown tool: ${name}` }
      }
      // Admin-only tools
      const adminOnly = ['get_users']
      if (adminOnly.includes(name) && user.role !== 'admin') {
        throw { code: -32001, message: `Tool '${name}' requires admin role` }
      }
      const content = await handler(args)
      return { content, isError: false }
    }

    // --- Resources ---
    case 'resources/list':
      return {
        resources: [
          {
            uri: 'skillify://analytics/summary',
            name: 'Platform Analytics Summary',
            description: 'Aggregated KPIs: users, courses, enrollments, completion rate',
            mimeType: 'application/json',
          },
          {
            uri: 'skillify://courses/catalog',
            name: 'Course Catalog',
            description: 'All approved courses with metadata',
            mimeType: 'application/json',
          },
        ],
      }

    case 'resources/read': {
      const { uri } = params
      if (uri === 'skillify://analytics/summary') {
        const content = await HANDLERS.get_analytics_summary({})
        return { contents: [{ uri, mimeType: 'application/json', text: content[0].text }] }
      }
      if (uri === 'skillify://courses/catalog') {
        const content = await HANDLERS.get_courses({ limit: 100 })
        return { contents: [{ uri, mimeType: 'application/json', text: content[0].text }] }
      }
      throw { code: -32602, message: `Unknown resource URI: ${uri}` }
    }

    // --- Prompts ---
    case 'prompts/list':
      return {
        prompts: [
          {
            name: 'analyze_student',
            description: 'Analyze a student\'s learning progress and suggest improvements',
            arguments: [{ name: 'studentId', description: 'Student ObjectId', required: true }],
          },
          {
            name: 'course_recommendation',
            description: 'Recommend courses for a student based on their history',
            arguments: [{ name: 'studentId', description: 'Student ObjectId', required: true }],
          },
          {
            name: 'quiz_question_generator',
            description: 'Generate quiz questions for a given topic and difficulty',
            arguments: [
              { name: 'topic', description: 'Topic or subject area', required: true },
              { name: 'difficulty', description: 'beginner | intermediate | advanced', required: false },
              { name: 'count', description: 'Number of questions to generate', required: false },
            ],
          },
          {
            name: 'lesson_outline_generator',
            description: 'Generate a structured lesson outline for a course topic',
            arguments: [
              { name: 'topic', description: 'Lesson topic', required: true },
              { name: 'courseCategory', description: 'Category the course belongs to', required: false },
            ],
          },
        ],
      }

    case 'prompts/get': {
      const { name, arguments: args = {} } = params
      return buildPrompt(name, args)
    }

    default:
      throw { code: -32601, message: `Method not found: ${method}` }
  }
}

// ---------------------------------------------------------------------------
// Prompt Builders
// ---------------------------------------------------------------------------
function buildPrompt(name, args) {
  switch (name) {
    case 'analyze_student':
      return {
        description: 'Analyze student progress',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Use the get_student_progress tool to fetch data for studentId="${args.studentId}", ` +
                `then provide a concise analysis covering: completed courses, quiz performance, ` +
                `learning pace, and 2-3 actionable recommendations to improve outcomes.`,
            },
          },
        ],
      }

    case 'course_recommendation':
      return {
        description: 'Recommend courses for a student',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Use get_student_progress for studentId="${args.studentId}" and get_courses to ` +
                `browse available content. Recommend 3 courses the student has not yet enrolled in, ` +
                `explaining why each is a good fit based on their history.`,
            },
          },
        ],
      }

    case 'quiz_question_generator':
      return {
        description: 'Generate quiz questions',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Generate ${args.count || 5} multiple-choice quiz questions about "${args.topic}" ` +
                `at ${args.difficulty || 'intermediate'} difficulty. ` +
                `Format each question as JSON matching this schema: ` +
                `{ questionText: string, options: [{ id: string, text: string, isCorrect: boolean }], explanation: string }. ` +
                `Return a JSON array.`,
            },
          },
        ],
      }

    case 'lesson_outline_generator':
      return {
        description: 'Generate lesson outline',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Create a structured lesson outline for the topic "${args.topic}"` +
                (args.courseCategory ? ` within the "${args.courseCategory}" category` : '') +
                `. Include: learning objectives (3-5), key concepts, suggested activities, ` +
                `and assessment ideas. Format as structured markdown.`,
            },
          },
        ],
      }

    default:
      throw { code: -32602, message: `Unknown prompt: ${name}` }
  }
}

// ---------------------------------------------------------------------------
// HTTP Handler — single POST endpoint handles all JSON-RPC methods
// ---------------------------------------------------------------------------
router.post('/', mcpAuth, async (req, res) => {
  const body = req.body

  // Handle batch requests (array of RPC calls)
  if (Array.isArray(body)) {
    const responses = await Promise.all(
      body.map((msg) => handleMessage(msg, req.mcpUser))
    )
    return res.json(responses.filter(Boolean)) // omit null (notifications)
  }

  const response = await handleMessage(body, req.mcpUser)
  if (response === null) return res.status(204).end() // notification — no response
  return res.json(response)
})

async function handleMessage(msg, user) {
  const { jsonrpc, id, method, params } = msg

  if (jsonrpc !== '2.0' || !method) {
    return rpcError(id ?? null, -32600, 'Invalid JSON-RPC request')
  }

  // Notifications (no id) — process but don't respond
  const isNotification = id === undefined || id === null

  try {
    const result = await dispatch(method, params ?? {}, user)
    if (isNotification) return null
    return rpcSuccess(id, result)
  } catch (err) {
    if (isNotification) return null
    const code = err.code ?? -32603
    const message = err.message ?? 'Internal error'
    return rpcError(id, code, message, err.data)
  }
}

// ---------------------------------------------------------------------------
// SSE endpoint — server-sent events for streaming tool results
// Clients connect here to receive pushed notifications
// ---------------------------------------------------------------------------
router.get('/sse', mcpAuth, (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  res.flushHeaders()

  // Send capabilities on connect
  const init = JSON.stringify({
    jsonrpc: '2.0',
    method: 'notifications/initialized',
    params: { serverInfo: { name: 'skillify-mcp', version: '1.0.0' } },
  })
  res.write(`data: ${init}\n\n`)

  // Keepalive ping every 30s
  const ping = setInterval(() => res.write(': ping\n\n'), 30000)
  req.on('close', () => clearInterval(ping))
})

module.exports = router
