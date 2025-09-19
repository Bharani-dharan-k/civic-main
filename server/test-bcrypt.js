const bcrypt = require('bcryptjs');

// Test bcrypt functionality
const testPassword = async () => {
    const password = 'password123';
    
    // Method 1: Using genSalt and hash separately
    const salt1 = await bcrypt.genSalt(10);
    const hash1 = await bcrypt.hash(password, salt1);
    const test1 = await bcrypt.compare(password, hash1);
    console.log('Method 1 (genSalt + hash):', test1 ? '✅ Works' : '❌ Failed');
    console.log('Hash1:', hash1);
    
    // Method 2: Using hashSync
    const hash2 = bcrypt.hashSync(password, 10);
    const test2 = await bcrypt.compare(password, hash2);
    console.log('Method 2 (hashSync):', test2 ? '✅ Works' : '❌ Failed');
    console.log('Hash2:', hash2);
    
    // Method 3: Compare with both
    const test3 = await bcrypt.compare(password, hash2);
    console.log('Cross test:', test3 ? '✅ Works' : '❌ Failed');
};

testPassword();