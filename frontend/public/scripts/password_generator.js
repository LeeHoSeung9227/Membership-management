const bcrypt = require('bcrypt');

async function generateHash() {
    try {
        const password = 'woody1234';
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('비밀번호:', password);
        console.log('해시값:', hash);
        console.log('\nMySQL 명령어:');
        console.log(`INSERT INTO admin (username, password) VALUES ('woody', '${hash}');`);
    } catch (error) {
        console.error('에러:', error);
    }
}

generateHash();