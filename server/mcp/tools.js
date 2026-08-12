/**
 * MCP Tool Definitions
 * Each tool follows the MCP spec: name, description, inputSchema (JSON Schema)
 */

const TOOLS = [
  {
    name: 'get_courses',
    description: 'Retrieve courses from Skillify. Supports filtering by category, level, status, and text search.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['Mathematics', 'Science', 'History', 'Computer Science', 'Language Arts', 'Economics', 'Arts'],
          description: 'Filter by course category',
        },
        level: {
          type: 'string',
          enum: ['Beginner', 'Intermediate', 'Advanced'],
          description: 'Filter by difficulty level',
        },
        status: {
          type: 'string',
          enum: ['draft', 'pending', 'approved', 'rejected'],
          description: 'Filter by approval status',
        },
        search: { type: 'string', description: 'Full-text search across title and description' },
        limit: { type: 'number', description: 'Max results to return (default 20)' },
      },
    },
  },
  {
    name: 'get_course_detail',
    description: 'Get full details of a course including its lessons and quizzes.',
    inputSchema: {
      type: 'object',
      required: ['courseId'],
      properties: {
        courseId: { type: 'string', description: 'MongoDB ObjectId of the course' },
      },
    },
  },
  {
    name: 'get_users',
    description: 'List users in the system. Filter by role or search by name/email.',
    inputSchema: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['admin', 'teacher', 'student'], description: 'Filter by user role' },
        search: { type: 'string', description: 'Search by name or email' },
        limit: { type: 'number', description: 'Max results (default 20)' },
      },
    },
  },
  {
    name: 'get_enrollments',
    description: 'Get enrollment records. Can filter by student, course, or status.',
    inputSchema: {
      type: 'object',
      properties: {
        studentId: { type: 'string', description: 'Filter by student ObjectId' },
        courseId: { type: 'string', description: 'Filter by course ObjectId' },
        status: { type: 'string', enum: ['active', 'completed', 'dropped'] },
        limit: { type: 'number', description: 'Max results (default 20)' },
      },
    },
  },
  {
    name: 'get_student_progress',
    description: 'Get detailed progress for a student, optionally scoped to a specific course.',
    inputSchema: {
      type: 'object',
      required: ['studentId'],
      properties: {
        studentId: { type: 'string', description: 'Student ObjectId' },
        courseId: { type: 'string', description: 'Scope to a specific course (optional)' },
      },
    },
  },
  {
    name: 'get_analytics_summary',
    description: 'High-level platform analytics: total users, courses, enrollments, completion rates.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_quiz_results',
    description: 'Get quiz attempt results for a student or for a specific quiz.',
    inputSchema: {
      type: 'object',
      properties: {
        studentId: { type: 'string', description: 'Filter by student' },
        quizId: { type: 'string', description: 'Filter by quiz' },
        passed: { type: 'boolean', description: 'Filter by pass/fail' },
        limit: { type: 'number', description: 'Max results (default 20)' },
      },
    },
  },
  {
    name: 'search_content',
    description: 'Full-text search across courses, lessons, and quizzes.',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string', description: 'Search query' },
        types: {
          type: 'array',
          items: { type: 'string', enum: ['course', 'lesson', 'quiz'] },
          description: 'Limit search to these content types (default: all)',
        },
      },
    },
  },
]

module.exports = { TOOLS }
