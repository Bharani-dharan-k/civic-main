const bcrypt = require('bcryptjs');

async function updateUserPassword() {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    console.log('Correct hash for password123:', hashedPassword);
}

updateUserPassword();