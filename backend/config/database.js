const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '9999',
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'oohjinDanceAcademy_DB',
    port: parseInt(process.env.MYSQLPORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('데이터베이스 연결 성공!');
        connection.release();
    } catch (err) {
        console.error('데이터베이스 연결 실패:', err);
        console.log('연결 재시도를 시작합니다...');
        setTimeout(testConnection, 10000);
    }
};

// Initial connection test
testConnection();

module.exports = pool;

