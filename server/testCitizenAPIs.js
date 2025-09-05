const axios = require('axios');

const testAPIs = async () => {
    console.log('🧪 Testing Citizen Dashboard APIs...\n');

    const baseURL = 'http://localhost:5000/api';

    // Test 1: Leaderboard
    try {
        console.log('1️⃣ Testing Leaderboard API...');
        const leaderboardResponse = await axios.get(`${baseURL}/auth/leaderboard`);
        console.log('✅ Leaderboard API working!');
        console.log('📊 Leaderboard data:');
        if (leaderboardResponse.data.leaderboard) {
            leaderboardResponse.data.leaderboard.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.name} - ${user.points} points`);
            });
        }
        console.log('');
    } catch (error) {
        console.log('❌ Leaderboard API failed:', error.message);
        console.log('');
    }

    // Test 2: Login with test citizen
    try {
        console.log('2️⃣ Testing Citizen Login...');
        const loginResponse = await axios.post(`${baseURL}/auth/citizen/login`, {
            email: 'rajesh@example.com',
            password: 'password123'
        });
        
        console.log('✅ Citizen login working!');
        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        console.log(`👤 Logged in as: ${user.name} (${user.email})`);
        console.log(`🎯 Points: ${user.points}`);
        console.log('');

        // Test 3: Get Profile with Auth
        try {
            console.log('3️⃣ Testing Profile API with Auth...');
            const profileResponse = await axios.get(`${baseURL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Profile API working!');
            console.log(`📋 Profile: ${profileResponse.data.user.name} - ${profileResponse.data.user.points} points`);
            console.log('');
        } catch (error) {
            console.log('❌ Profile API failed:', error.message);
            console.log('');
        }

    } catch (error) {
        console.log('❌ Citizen login failed:', error.message);
        console.log('');
    }

    console.log('🏁 API testing complete!');
};

testAPIs();
