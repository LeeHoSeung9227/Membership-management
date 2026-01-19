const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await pool.execute(
            'SELECT id, username FROM admin WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
        }

        req.user = users[0];
        next();
    } catch (err) {
        console.error('인증 에러:', err);
        return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
};

module.exports = authenticateToken;

