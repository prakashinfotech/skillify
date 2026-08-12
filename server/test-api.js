require('dotenv').config();

const API_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('Starting Skillify API Smoke Tests...\n');
  const results = [];
  let studentToken = null;
  let adminToken = null;
  let targetCourseId = null;

  async function test(name, fn) {
    try {
      const res = await fn();
      results.push({ name, status: '✅ Pass', notes: res || '' });
    } catch (err) {
      results.push({ name, status: '❌ Fail', notes: err.message || String(err) });
    }
  }

  // 1. Health check
  await test('GET /health', async () => {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Success is false');
    return data.message;
  });

  // 2. Admin Login
  await test('POST /auth/login (Admin)', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@skillify.com', password: 'Admin@1234' })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const data = await res.json();
    if (!data.success || !data.data?.accessToken) throw new Error(data.message || 'No token returned');
    adminToken = data.data.accessToken;
    return 'Token obtained successfully';
  });

  // 3. Student Login
  await test('POST /auth/login (Student)', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student1@skillify.com', password: 'Student@1234' })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const data = await res.json();
    if (!data.success || !data.data?.accessToken) throw new Error(data.message || 'No token returned');
    studentToken = data.data.accessToken;
    return 'Token obtained successfully';
  });

  // 4. Get Course Catalog
  await test('GET /courses (Student)', async () => {
    if (!studentToken) throw new Error('Skipped: Student token missing');
    const res = await fetch(`${API_URL}/courses?limit=20`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const courses = data?.data?.courses || data?.data || [];
    if (!data.success) throw new Error(data.message || 'Failed');

    // Get current enrollments to find an unenrolled course
    const myEnrollmentsRes = await fetch(`${API_URL}/enrollments/my`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    if (!myEnrollmentsRes.ok) throw new Error(`Enrollments HTTP ${myEnrollmentsRes.status}`);
    const myEnrollmentsData = await myEnrollmentsRes.json();
    const enrollmentsList = myEnrollmentsData?.data?.enrollments || myEnrollmentsData?.data || [];
    
    // Find course IDs that are currently active or completed
    const enrolledCourseIds = new Set();
    for (const e of enrollmentsList) {
      if (e.status === 'active' || e.status === 'completed') {
        const cid = e.course?._id || e.course || String(e);
        enrolledCourseIds.add(cid);
      }
    }

    // Find the first course the student is NOT enrolled in
    for (const c of courses) {
      const cid = c._id || c.id;
      if (!enrolledCourseIds.has(cid)) {
        targetCourseId = cid;
        break;
      }
    }

    if (!targetCourseId) {
      throw new Error('Could not find any course that the student is not enrolled in');
    }

    return `Total courses: ${courses.length}. Found unenrolled course ID: ${targetCourseId}`;
  });

  // 5. Get Student Progress
  await test('GET /progress/overview (Student)', async () => {
    if (!studentToken) throw new Error('Skipped: Student token missing');
    const res = await fetch(`${API_URL}/progress/overview`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed');
    return 'Progress overview retrieved';
  });

  // 6. Admin stats
  await test('GET /admin/stats (Admin)', async () => {
    if (!adminToken) throw new Error('Skipped: Admin token missing');
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed');
    const stats = data.data || {};
    return `Users: ${stats.totalUsers || 0}, Courses: ${stats.totalCourses || 0}`;
  });

  // 7. MCP Initialize
  await test('POST /mcp initialize (Admin)', async () => {
    if (!adminToken) throw new Error('Skipped: Admin token missing');
    const res = await fetch(`${API_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || 'RPC Error');
    return `Protocol: ${data.result?.protocolVersion}, Server: ${data.result?.serverInfo?.name}`;
  });

  // 8. MCP tools/list
  await test('POST /mcp tools/list (Admin)', async () => {
    if (!adminToken) throw new Error('Skipped: Admin token missing');
    const res = await fetch(`${API_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || 'RPC Error');
    const tools = data.result?.tools || [];
    return `Found ${tools.length} MCP tools`;
  });

  // 9. MCP call analytics tool
  await test('POST /mcp call get_analytics_summary (Admin)', async () => {
    if (!adminToken) throw new Error('Skipped: Admin token missing');
    const res = await fetch(`${API_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'get_analytics_summary', arguments: {} }
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || 'RPC Error');
    return 'Analytics summary tool returned successfully';
  });

  // 10. Enroll and Unenroll
  await test('POST /enrollments & DELETE /enrollments/:courseId (Student)', async () => {
    if (!studentToken) throw new Error('Skipped: Student token missing');
    if (!targetCourseId) throw new Error('Skipped: No course ID available');
    
    // Enroll
    const enrollRes = await fetch(`${API_URL}/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ courseId: targetCourseId })
    });
    
    const enrollData = await enrollRes.json();
    
    // Unenroll to clean up
    const unenrollRes = await fetch(`${API_URL}/enrollments/${targetCourseId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    if (!enrollRes.ok) {
      throw new Error(`Enroll HTTP ${enrollRes.status}: ${enrollData.message || 'Failed'}`);
    }
    if (!enrollData.success) {
      throw new Error(`Enroll Success is false: ${enrollData.message || 'Failed'}`);
    }
    if (!unenrollRes.ok) {
      throw new Error(`Unenroll HTTP ${unenrollRes.status}`);
    }
    
    return `Enrolled & unenrolled course ${targetCourseId} successfully`;
  });

  // Print results table
  console.log('\n## API Smoke Test Results\n');
  console.log('| Endpoint | Status | Details / Notes |');
  console.log('|---|---|---|');
  for (const r of results) {
    console.log(`| ${r.name} | ${r.status} | ${r.notes} |`);
  }
  console.log('');

  const failed = results.filter(r => r.status.includes('❌'));
  if (failed.length > 0) {
    console.log(`❌ Some tests failed (${failed.length}/${results.length})`);
    process.exit(1);
  } else {
    console.log('✅ All API tests passed successfully!');
    process.exit(0);
  }
}

// Small helper to wait if server needs time to start
async function waitForServer() {
  const maxRetries = 10;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) {
        return;
      }
    } catch (e) {}
    console.log(`Waiting for server to start (${i}/${maxRetries})...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('Server not responding. Starting tests anyway.');
}

waitForServer().then(runTests);
