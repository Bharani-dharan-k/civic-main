// Simple test in browser console
// Copy and paste this into the browser console while logged in as Dharun

console.log('🧪 Testing Department Head API calls from browser...');

// Get token from localStorage
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

if (!token) {
    console.error('❌ No token found in localStorage');
} else {
    console.log('✅ Token found:', token.substring(0, 50) + '...');
    
    // Test dashboard endpoint
    fetch('http://localhost:5000/api/department-head/dashboard', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Dashboard response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('✅ Dashboard API Success:');
        console.log(JSON.stringify(data, null, 2));
    })
    .catch(error => {
        console.error('❌ Dashboard API Error:', error);
    });
    
    // Test tasks endpoint
    fetch('http://localhost:5000/api/department-head/tasks', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Tasks response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('✅ Tasks API Success:');
        console.log(`Found ${data.length} tasks`);
        data.forEach((task, i) => {
            console.log(`${i+1}. ${task.title} - ${task.status}`);
        });
    })
    .catch(error => {
        console.error('❌ Tasks API Error:', error);
    });
}