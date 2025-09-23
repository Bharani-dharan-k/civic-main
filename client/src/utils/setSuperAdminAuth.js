// Helper utility to set super admin authentication
// This script can be run in browser console to authenticate as super admin

const setSuperAdminAuth = async () => {
    try {
        console.log('🔐 Logging in as Super Admin...');

        const response = await fetch('http://localhost:5000/api/auth/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'bharani@gmail.com',
                password: 'password',
                role: 'super_admin'
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Super admin login successful!');
            console.log('📧 Email:', data.user.email);
            console.log('👤 Name:', data.user.name);
            console.log('🔑 Role:', data.user.role);

            // Store token and user info in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            console.log('🎫 Token stored in localStorage!');
            console.log('🔄 Please refresh the page to see the analytics data');

            return data;
        } else {
            console.error('❌ Login failed:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
};

// Auto-run if this script is included
if (typeof window !== 'undefined') {
    // Make function globally available
    window.setSuperAdminAuth = setSuperAdminAuth;
    console.log('🛠️ Super Admin Auth Helper Loaded!');
    console.log('📝 Run setSuperAdminAuth() to authenticate as super admin');
}

export default setSuperAdminAuth;