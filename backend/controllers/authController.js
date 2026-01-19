const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const login = async (req, res) => {
    try {
        console.log('로그인 요청 수신:', req.body.username);
        const { username, password } = req.body;
        
        const [rows] = await pool.execute(
            'SELECT * FROM admin WHERE username = ?',
            [username]
        );
        console.log('데이터베이스 조회 결과:', rows);

        if (rows.length === 0) {
            console.log('사용자를 찾을 수 없음');
            return res.status(401).json({ message: '로그인 실패: 사용자를 찾을 수 없습니다.' });
        }

        const user = rows[0];
        console.log('찾은 사용자:', user);
        
        const storedPassword = user.password || user.PASSWORD;
        
        if (!storedPassword) {
            console.log('저장된 비밀번호가 없음');
            return res.status(401).json({ message: '로그인 실패: 비밀번호 오류.' });
        }

        const validPassword = await bcrypt.compare(password, storedPassword);
        console.log('비밀번호 검증 결과:', validPassword);

        if (!validPassword) {
            console.log('잘못된 비밀번호');
            return res.status(401).json({ message: '로그인 실패: 잘못된 비밀번호입니다.' });
        }

        const token = jwt.sign(
            { id: user.ID || user.id, username: user.USERNAME || user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('로그인 성공, 토큰 생성');
        res.json({
            success: true,
            token,
            user: {
                id: user.ID || user.id,
                username: user.USERNAME || user.username
            }
        });
    } catch (err) {
        console.error('로그인 처리 중 상세 오류:', err);
        res.status(500).json({ 
            message: '서버 오류', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

const verifyPassword = async (req, res) => {
    try {
        const { current_password } = req.body;
        
        const [users] = await pool.execute(
            'SELECT password FROM admin WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const validPassword = await bcrypt.compare(current_password, users[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('비밀번호 검증 에러:', err);
        res.status(500).json({ message: '서버 오류' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        
        const [users] = await pool.execute(
            'SELECT password FROM admin WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const validPassword = await bcrypt.compare(current_password, users[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await pool.execute(
            'UPDATE admin SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (err) {
        console.error('비밀번호 변경 에러:', err);
        res.status(500).json({ message: '서버 오류' });
    }
};

const changeUsername = async (req, res) => {
    try {
        const { current_password, new_username } = req.body;
        
        const [users] = await pool.execute(
            'SELECT password FROM admin WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const validPassword = await bcrypt.compare(current_password, users[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
        }

        // 새 아이디 중복 확인
        const [existingUser] = await pool.execute(
            'SELECT id FROM admin WHERE username = ? AND id != ?',
            [new_username, req.user.id]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: '이미 사용 중인 아이디입니다.' });
        }

        await pool.execute(
            'UPDATE admin SET username = ? WHERE id = ?',
            [new_username, req.user.id]
        );

        res.json({ success: true, message: '아이디가 성공적으로 변경되었습니다.' });
    } catch (err) {
        console.error('아이디 변경 에러:', err);
        res.status(500).json({ message: '서버 오류' });
    }
};

module.exports = {
    login,
    verifyPassword,
    changePassword,
    changeUsername
};

