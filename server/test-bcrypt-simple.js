const bcrypt = require('bcryptjs');

async function testBcrypt() {
    const password = 'password123';
    
    console.log('=== BCRYPT TEST ===');
    
    // Test 1: Direct comparison
    const hash1 = bcrypt.hashSync(password, 10);
    const test1 = bcrypt.compareSync(password, hash1);
    console.log('Direct sync test:', test1 ? '✅ Works' : '❌ Failed');
    
    // Test 2: Async comparison  
    const hash2 = await bcrypt.hash(password, 10);
    const test2 = await bcrypt.compare(password, hash2);
    console.log('Async test:', test2 ? '✅ Works' : '❌ Failed');
    
    // Test 3: What the auth controller uses
    const inputPassword = 'password123';
    const storedHash = bcrypt.hashSync('password123', 10);
    console.log('Stored hash:', storedHash);
    
    const isMatch = await bcrypt.compare(inputPassword, storedHash);
    console.log('Auth controller style:', isMatch ? '✅ Works' : '❌ Failed');
    
    return storedHash;
}

testBcrypt().then(hash => {
    console.log('Use this hash:', hash);
});