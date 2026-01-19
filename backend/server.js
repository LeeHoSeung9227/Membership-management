const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: envFile });

const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    credentials: true
}));

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/image', express.static(path.join(__dirname, '../frontend/public/images')));

// API Routes
app.use('/api', routes);

// Frontend Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/홈페이지.html'));
});

app.get('/홈페이지', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/홈페이지.html'));
});

app.get('/로그인', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/로그인.html'));
});

app.get('/회원관리', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/회원관리.html'));
});

app.get('/회원정보등록', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/회원정보등록.html'));
});

app.get('/출석부', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/출석부.html'));
});

app.get('/수업관리', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/수업관리.html'));
});

app.get('/매출_통계페이지', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/매출_통계페이지.html'));
});

app.get('/설정', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/설정.html'));
});

app.get('/선생님관리', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/선생님관리.html'));
});

// Error Handlers
app.use((req, res) => {
    res.status(404).send('페이지를 찾을 수 없습니다.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('서버 에러가 발생했습니다.');
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 포트 ${PORT}에서 실행중입니다.`);
    console.log(`데이터베이스: ${process.env.MYSQL_DATABASE || process.env.DB_NAME}`);
    console.log('서버 시작 시간:', new Date().toLocaleString());
});

// Graceful Shutdown
const pool = require('./config/database');
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    console.log('서버 종료 중...');
    
    pool.end((err) => {
        if (err) {
            console.error('데이터베이스 연결 종료 중 에러:', err);
        } else {
            console.log('데이터베이스 연결이 안전하게 종료되었습니다.');
        }
        process.exit(err ? 1 : 0);
    });
});

module.exports = app;

