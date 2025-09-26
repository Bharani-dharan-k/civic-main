const axios = require('axios');

const createChasMunicipalAdmin = async () => {
    try {
        console.log('🔐 Logging in as SuperAdmin...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'bhupesh@gmail.com',
            password: '123456'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Create Chas Municipal Admin
        const adminData = {
            name: 'Yahya Admin',
            email: 'yahya@chas.in',
            phone: '9876543200',
            password: 'password123',
            role: 'municipality_admin',
            municipality: 'Chas Municipality'
        };
        
        console.log('\n🏛️ Creating Chas Municipality Admin...');
        console.log('Admin data:', adminData);
        
        try {
            const response = await axios.post('http://localhost:5000/api/municipal/staff', 
                adminData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Created Chas Municipality Admin:', response.data);
        } catch (error) {
            console.error('❌ Failed to create admin:', error.response?.data?.message || error.message);
            
            // Try alternative approach - maybe there's a different endpoint
            console.log('\n🔄 Trying alternative admin creation...');
            try {
                const altResponse = await axios.post('http://localhost:5000/api/admin/create-admin', 
                    adminData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log('✅ Created admin via alternative endpoint:', altResponse.data);
            } catch (altError) {
                console.error('❌ Alternative endpoint also failed:', altError.response?.data?.message || altError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

createChasMunicipalAdmin();