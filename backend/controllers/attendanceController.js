const pool = require('../config/database');

module.exports = {
    createAttendance: async (req, res) => {
        // server.js.old의 app.post('/api/attendance') 코드를 여기에 구현
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    },
    getAttendance: async (req, res) => {
        // server.js.old의 app.get('/api/attendance') 코드를 여기에 구현
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    }
};

