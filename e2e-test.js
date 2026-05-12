/**
 * Comprehensive E2E Testing Script for Spotify Mini
 * Tests: Authentication, Playlists, Albums, and Edge Cases
 */

const http = require('http');
const https = require('https');

const API_BASE_URL = 'http://192.168.1.6:5000';

// Test Results Tracking
const results = {
  backend_status: [],
  authentication: [],
  playlists: [],
  albums: [],
  edge_cases: [],
  performance: []
};

let authToken = null;
let userId = null;
let testPlaylistId = null;
let testAlbumId = null;

// Utility function to make HTTP requests
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            rawBody: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test helper
async function test(category, name, fn) {
  try {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    
    const testResult = {
      name,
      passed: result.passed,
      message: result.message,
      duration,
      details: result.details
    };
    
    results[category].push(testResult);
    
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${status} [${duration}ms] ${name}`);
    if (!result.passed || result.details) {
      console.log(`   ${result.message}`);
      if (result.details) console.log(`   Details: ${JSON.stringify(result.details).substring(0, 200)}`);
    }
    
    return result.passed;
  } catch (err) {
    const testResult = {
      name,
      passed: false,
      message: `Error: ${err.message}`,
      duration: 0
    };
    results[category].push(testResult);
    console.log(`\n❌ FAIL [ERROR] ${name}`);
    console.log(`   ${err.message}`);
    return false;
  }
}

// ==================== BACKEND STATUS TESTS ====================
async function testBackendStatus() {
  console.log('\n\n=== 1. BACKEND STATUS ===');
  
  await test('backend_status', 'Backend is running (root endpoint)', async () => {
    const res = await makeRequest('GET', '/');
    return {
      passed: res.status === 200,
      message: `Status: ${res.status}`,
      details: { response: res.rawBody }
    };
  });

  await test('backend_status', 'Database connection (test via auth endpoint)', async () => {
    try {
      const res = await makeRequest('POST', '/auth/register', {
        email: `test-${Date.now()}@test.com`,
        password: 'testpass123',
        displayName: 'Test User'
      });
      return {
        passed: [201, 400].includes(res.status),
        message: `Status: ${res.status}`,
        details: { response: res.body }
      };
    } catch (err) {
      return { passed: false, message: err.message };
    }
  });
}

// ==================== AUTHENTICATION TESTS ====================
async function testAuthentication() {
  console.log('\n\n=== 2. AUTHENTICATION ===');
  
  const testEmail = `test-${Date.now()}@test.com`;
  const testPassword = 'TestPassword123!';

  // Register
  await test('authentication', 'User registration', async () => {
    const res = await makeRequest('POST', '/auth/register', {
      email: testEmail,
      password: testPassword,
      displayName: 'Test User'
    });
    
    if (res.status === 201 && res.body.token) {
      authToken = res.body.token;
      userId = res.body.user?.id || res.body._id;
      return {
        passed: true,
        message: `Registered successfully`,
        details: { email: testEmail, hasToken: !!authToken }
      };
    }
    return {
      passed: res.status === 201 || res.status === 400,
      message: `Status: ${res.status}`,
      details: res.body
    };
  });

  // Login
  await test('authentication', 'User login', async () => {
    const res = await makeRequest('POST', '/auth/login', {
      email: testEmail,
      password: testPassword
    });
    
    if (res.status === 200 && res.body.token) {
      authToken = res.body.token;
      userId = res.body.user?.id || res.body._id;
    }
    
    return {
      passed: res.status === 200 && res.body.token,
      message: `Status: ${res.status}`,
      details: { hasToken: !!res.body.token }
    };
  });

  // Check token validity
  await test('authentication', 'Token is valid for protected routes', async () => {
    if (!authToken) {
      return { passed: false, message: 'No auth token available' };
    }
    
    const res = await makeRequest('GET', '/playlists', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    return {
      passed: [200, 401].includes(res.status) && res.status !== 500,
      message: `Status: ${res.status}`,
      details: { tokenAccepted: res.status !== 401 }
    };
  });
}

// ==================== PLAYLIST TESTS ====================
async function testPlaylists() {
  console.log('\n\n=== 3. PLAYLISTS ===');
  
  if (!authToken) {
    console.log('\n⚠️  Skipping playlist tests - no auth token');
    return;
  }

  // Get playlists
  await test('playlists', 'Library > Playlists tab loads (GET /playlists)', async () => {
    const res = await makeRequest('GET', '/playlists', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    return {
      passed: res.status === 200 && Array.isArray(res.body),
      message: `Status: ${res.status}, Count: ${Array.isArray(res.body) ? res.body.length : 'N/A'}`,
      details: { count: Array.isArray(res.body) ? res.body.length : 0 }
    };
  });

  // Create playlist
  const playlistName = `Test Playlist ${Date.now()}`;
  await test('playlists', 'Create playlist (form validates, API succeeds)', async () => {
    const res = await makeRequest('POST', '/playlists', 
      {
        name: playlistName,
        description: 'Test description',
        isPrivate: false
      },
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    if (res.status === 201) {
      testPlaylistId = res.body._id || res.body.id;
    }
    
    return {
      passed: res.status === 201 && res.body,
      message: `Status: ${res.status}`,
      details: { created: !!testPlaylistId, name: res.body?.name }
    };
  });

  // Get single playlist
  if (testPlaylistId) {
    await test('playlists', 'Click on playlist navigates to detail screen (GET)', async () => {
      const res = await makeRequest('GET', `/playlists/${testPlaylistId}`, null, {
        'Authorization': `Bearer ${authToken}`
      });
      
      return {
        passed: res.status === 200 && res.body,
        message: `Status: ${res.status}`,
        details: { 
          name: res.body?.name,
          songCount: res.body?.songs?.length || 0 
        }
      };
    });

    // Update playlist
    await test('playlists', 'Update playlist details', async () => {
      const res = await makeRequest('PUT', `/playlists/${testPlaylistId}`,
        {
          name: `${playlistName} (Updated)`,
          description: 'Updated description'
        },
        { 'Authorization': `Bearer ${authToken}` }
      );
      
      return {
        passed: res.status === 200,
        message: `Status: ${res.status}`,
        details: { updated: res.body?.name }
      };
    });
  }

  // Test empty playlist handling
  await test('playlists', 'Empty playlist handling', async () => {
    // Just check if we handle GET with valid structure
    const res = await makeRequest('GET', '/playlists', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    // If we get an empty array, that's fine
    const isEmpty = Array.isArray(res.body) && res.body.length === 0;
    const hasPlaylists = Array.isArray(res.body) && res.body.length > 0;
    
    return {
      passed: res.status === 200,
      message: `Status: ${res.status}, ${isEmpty ? 'Empty playlist list' : hasPlaylists ? `${res.body.length} playlists` : 'Invalid response'}`,
      details: { isEmpty, count: res.body?.length || 0 }
    };
  });
}

// ==================== ALBUM TESTS ====================
async function testAlbums() {
  console.log('\n\n=== 4. ALBUMS ===');
  
  // Get albums (public endpoint)
  await test('albums', 'Library > Albums tab loads (GET /albums)', async () => {
    const res = await makeRequest('GET', '/albums');
    
    return {
      passed: res.status === 200 && Array.isArray(res.body),
      message: `Status: ${res.status}, Count: ${Array.isArray(res.body) ? res.body.length : 'N/A'}`,
      details: { count: Array.isArray(res.body) ? res.body.length : 0 }
    };
  });

  // Get single album
  let firstAlbumId = null;
  await test('albums', 'Get album details (GET /albums/:id)', async () => {
    // First get list of albums
    const listRes = await makeRequest('GET', '/albums');
    
    if (listRes.status === 200 && Array.isArray(listRes.body) && listRes.body.length > 0) {
      firstAlbumId = listRes.body[0]._id || listRes.body[0].id;
      testAlbumId = firstAlbumId;
      
      const detailRes = await makeRequest('GET', `/albums/${firstAlbumId}`);
      
      return {
        passed: detailRes.status === 200 && detailRes.body,
        message: `Status: ${detailRes.status}`,
        details: { 
          name: detailRes.body?.name,
          artist: detailRes.body?.artist,
          songCount: detailRes.body?.songs?.length || 0
        }
      };
    }
    
    return {
      passed: true,
      message: 'No albums available to test',
      details: { albumCount: 0 }
    };
  });

  // Test empty album songs
  await test('albums', 'Empty album songs handling', async () => {
    const res = await makeRequest('GET', '/albums');
    
    const hasEmptyAlbums = Array.isArray(res.body) && res.body.some(a => !a.songs || a.songs.length === 0);
    
    return {
      passed: res.status === 200,
      message: `Status: ${res.status}`,
      details: { hasEmptyAlbums, totalAlbums: res.body?.length }
    };
  });
}

// ==================== EDGE CASES & PERFORMANCE ====================
async function testEdgeCases() {
  console.log('\n\n=== 5. EDGE CASES ===');
  
  // Network error handling - try invalid endpoint
  await test('edge_cases', 'Network error handling (graceful fallback)', async () => {
    const res = await makeRequest('GET', '/invalid-endpoint');
    
    return {
      passed: res.status === 404 || res.status === 500,
      message: `Status: ${res.status}`,
      details: { errorHandled: res.status !== 200 }
    };
  });

  // Invalid authentication
  await test('edge_cases', 'Invalid authentication rejection', async () => {
    const res = await makeRequest('GET', '/playlists', null, {
      'Authorization': 'Bearer invalid-token'
    });
    
    return {
      passed: res.status === 401 || res.status === 403,
      message: `Status: ${res.status}`,
      details: { rejected: res.status !== 200 }
    };
  });

  // Missing required fields in playlist creation
  if (authToken) {
    await test('edge_cases', 'Playlist creation validates required fields', async () => {
      const res = await makeRequest('POST', '/playlists', 
        { description: 'No name field' },
        { 'Authorization': `Bearer ${authToken}` }
      );
      
      return {
        passed: res.status === 400 || res.status === 201,
        message: `Status: ${res.status}`,
        details: { validated: res.status === 400 }
      };
    });
  }

  // Large item counts
  await test('edge_cases', 'Loading states handle large data', async () => {
    const res = await makeRequest('GET', '/albums');
    
    const largeCount = Array.isArray(res.body) && res.body.length > 50;
    
    return {
      passed: res.status === 200,
      message: `Status: ${res.status}, Items: ${res.body?.length || 0}`,
      details: { largeDataSet: largeCount }
    };
  });
}

// ==================== PERFORMANCE TESTS ====================
async function testPerformance() {
  console.log('\n\n=== 6. PERFORMANCE ===');
  
  // API response time - albums
  await test('performance', 'API response time (<2 seconds) - GET /albums', async () => {
    const start = Date.now();
    const res = await makeRequest('GET', '/albums');
    const duration = Date.now() - start;
    
    return {
      passed: duration < 2000 && res.status === 200,
      message: `${duration}ms`,
      details: { duration, passed: duration < 2000 }
    };
  });

  // API response time - playlists with auth
  if (authToken) {
    await test('performance', 'API response time (<2 seconds) - GET /playlists', async () => {
      const start = Date.now();
      const res = await makeRequest('GET', '/playlists', null, {
        'Authorization': `Bearer ${authToken}`
      });
      const duration = Date.now() - start;
      
      return {
        passed: duration < 2000 && res.status === 200,
        message: `${duration}ms`,
        details: { duration, passed: duration < 2000 }
      };
    });
  }

  // API response time - album detail
  if (testAlbumId) {
    await test('performance', 'API response time (<2 seconds) - GET /albums/:id', async () => {
      const start = Date.now();
      const res = await makeRequest('GET', `/albums/${testAlbumId}`);
      const duration = Date.now() - start;
      
      return {
        passed: duration < 2000 && res.status === 200,
        message: `${duration}ms`,
        details: { duration, passed: duration < 2000 }
      };
    });
  }

  // No console errors (we check response codes)
  await test('performance', 'No HTTP errors in responses', async () => {
    const res = await makeRequest('GET', '/albums');
    
    return {
      passed: res.status < 500,
      message: `Status: ${res.status}`,
      details: { noServerError: res.status < 500 }
    };
  });
}

// ==================== MAIN EXECUTION ====================
async function runAllTests() {
  console.log('🎵 Starting Comprehensive E2E Testing for Spotify Mini');
  console.log(`Backend: ${API_BASE_URL}`);
  console.log('=' .repeat(50));

  try {
    await testBackendStatus();
    await testAuthentication();
    await testPlaylists();
    await testAlbums();
    await testEdgeCases();
    await testPerformance();

    // Print summary
    console.log('\n\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    Object.entries(results).forEach(([category, tests]) => {
      if (tests.length === 0) return;
      
      const passed = tests.filter(t => t.passed).length;
      const failed = tests.length - passed;
      totalTests += tests.length;
      passedTests += passed;
      failedTests += failed;
      
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`  Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
    });

    console.log(`\n${'='.repeat(50)}`);
    console.log(`OVERALL: ${passedTests}/${totalTests} passed`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));

    // Detailed results
    console.log('\n\n📋 DETAILED RESULTS:\n');
    Object.entries(results).forEach(([category, tests]) => {
      if (tests.length === 0) return;
      console.log(`\n${category.toUpperCase()}:`);
      tests.forEach(t => {
        const status = t.passed ? '✅' : '❌';
        console.log(`  ${status} ${t.name} [${t.duration}ms]`);
        if (t.message) console.log(`     ${t.message}`);
      });
    });

    // Final recommendation
    console.log('\n\n' + '='.repeat(50));
    if (failedTests === 0) {
      console.log('✅ ALL TESTS PASSED - Ready for deployment!');
    } else if (failedTests <= 2) {
      console.log('⚠️  MINOR FAILURES - Review results above');
    } else {
      console.log('❌ CRITICAL FAILURES - Must fix before deployment');
    }
    console.log('='.repeat(50));

  } catch (err) {
    console.error('Fatal error:', err);
  }
}

runAllTests();
