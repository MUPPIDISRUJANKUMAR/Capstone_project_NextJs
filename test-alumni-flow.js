// Test script to verify the alumni approval flow
// Run with: node test-alumni-flow.js

const BASE_URL = 'http://localhost:3000';

// Test data - replace with actual IDs from your Firebase
const ALUMNI_ID = 'YxnYaREN6tbZaAq3uuSQFj3gtwx2'; // Replace with actual alumni ID
const STUDENT_ID = 'YOUR_STUDENT_ID'; // Replace with actual student ID

async function testAlumniFlow() {
  console.log('🧪 Testing Alumni Approval Flow...\n');

  try {
    // Step 1: Check if alumni can see their dashboard
    console.log('1️⃣ Testing Alumni Dashboard...');
    const dashboardResponse = await fetch(`${BASE_URL}/api/chat-requests?userId=${ALUMNI_ID}&status=approved`);
    const dashboardData = await dashboardResponse.json();
    
    if (dashboardResponse.ok) {
      console.log('✅ Alumni dashboard API working');
      console.log(`📊 Found ${dashboardData.requests?.length || 0} approved requests`);
    } else {
      console.log('❌ Alumni dashboard API failed:', dashboardData.error);
    }

    // Step 2: Test user details API
    console.log('\n2️⃣ Testing User Details API...');
    if (dashboardData.requests && dashboardData.requests.length > 0) {
      const studentId = dashboardData.requests[0].fromUserId;
      const userResponse = await fetch(`${BASE_URL}/api/users/${studentId}`);
      const userData = await userResponse.json();
      
      if (userResponse.ok) {
        console.log('✅ User details API working');
        console.log(`👤 Student: ${userData.displayName || userData.email}`);
      } else {
        console.log('❌ User details API failed:', userData.error);
      }
    } else {
      console.log('⚠️  No approved requests to test user details');
    }

    // Step 3: Test notifications API
    console.log('\n3️⃣ Testing Notifications API...');
    const notificationsResponse = await fetch(`${BASE_URL}/api/notifications?userId=${ALUMNI_ID}`);
    const notificationsData = await notificationsResponse.json();
    
    if (notificationsResponse.ok) {
      console.log('✅ Notifications API working');
      console.log(`🔔 Found ${notificationsData.notifications?.length || 0} notifications`);
      
      // Check for chat request notifications
      const chatRequests = notificationsData.notifications?.filter(n => n.type === 'chat_request') || [];
      console.log(`💬 Found ${chatRequests.length} chat requests`);
    } else {
      console.log('❌ Notifications API failed:', notificationsData.error);
    }

    // Step 4: Test approve/disapprove actions
    console.log('\n4️⃣ Testing Approve/Disapprove Actions...');
    if (chatRequests && chatRequests.length > 0) {
      const requestId = chatRequests[0].requestId;
      const notificationId = chatRequests[0].id;
      
      // Test approve action
      const approveResponse = await fetch(`${BASE_URL}/api/chat-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          requestId: requestId,
          fromUserId: ALUMNI_ID
        })
      });
      
      if (approveResponse.ok) {
        console.log('✅ Approve action working');
      } else {
        console.log('❌ Approve action failed:', await approveResponse.json());
      }
    } else {
      console.log('⚠️  No chat requests to test approve/disapprove');
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Instructions for running the test
console.log('📋 Alumni Flow Test Instructions:');
console.log('1. Make sure your Next.js dev server is running on localhost:3000');
console.log('2. Update ALUMNI_ID and STUDENT_ID in this script with actual Firebase user IDs');
console.log('3. Run: node test-alumni-flow.js\n');

// Uncomment the line below to run the test automatically
// testAlumniFlow();
