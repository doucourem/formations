import fetch from 'node-fetch';

async function debugTransactions() {
  const baseUrl = 'https://8259cca0-a4d7-4ef4-b8c8-5c33beeead64-00-115etnl7mlnn2.riker.replit.dev';
  
  try {
    // Step 1: Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✅ Login successful, cookies:', cookies ? 'received' : 'none');
    
    // Step 2: Test pending count endpoint
    console.log('\n📊 Testing pending count endpoint...');
    const countResponse = await fetch(`${baseUrl}/api/stats/pending-count`, {
      headers: { 'Cookie': cookies || '' }
    });
    const countData = await countResponse.json();
    console.log('Pending count response:', countData);
    
    // Step 3: Test pending transactions endpoint with debug
    console.log('\n📋 Testing pending transactions endpoint...');
    const pendingResponse = await fetch(`${baseUrl}/api/transactions/pending`, {
      headers: { 'Cookie': cookies || '' }
    });
    
    console.log('Response status:', pendingResponse.status);
    console.log('Response headers:', Object.fromEntries(pendingResponse.headers.entries()));
    
    const pendingData = await pendingResponse.json();
    console.log('Pending transactions count:', Array.isArray(pendingData) ? pendingData.length : 'not array');
    console.log('Pending transactions data:', pendingData);
    
    // Step 4: Test all transactions endpoint for comparison
    console.log('\n📋 Testing all transactions endpoint...');
    const allResponse = await fetch(`${baseUrl}/api/transactions`, {
      headers: { 'Cookie': cookies || '' }
    });
    const allData = await allResponse.json();
    console.log('All transactions count:', Array.isArray(allData) ? allData.length : 'not array');
    
    // Step 5: Show status breakdown
    if (Array.isArray(allData)) {
      const statusCounts = {};
      allData.forEach(t => {
        statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      });
      console.log('Status breakdown:', statusCounts);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugTransactions();