// test-password.js
const bcrypt = require('bcrypt');

const testPasswordHashing = async () => {
    // 1. Original password
    const originalPassword = "H4scMr5^";
    console.log('Original Password:', originalPassword);

    // 2. Hash it
    const hashedPassword = await bcrypt.hash(originalPassword, 10);
    console.log('Newly Hashed Password:', hashedPassword);

    // 3. Compare with stored hash
    const storedHash = "$2b$10$IpQI6EruPYGZ15P1U.UUKeafT4kO4jKG3L0TZ60wFlErZWHCTa26K";
    console.log('Stored Hash:', storedHash);

    // 4. Test both comparisons
    const isMatchWithStored = await bcrypt.compare(originalPassword, storedHash);
    console.log('Matches with stored hash:', isMatchWithStored);

    const isMatchWithNew = await bcrypt.compare(originalPassword, hashedPassword);
    console.log('Matches with new hash:', isMatchWithNew);
};

testPasswordHashing();