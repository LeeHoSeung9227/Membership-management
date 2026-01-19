const pool = require('../config/database');

module.exports = {
    getMonthlyStatistics: async (req, res) => {
        // server.js.old의 app.get('/api/statistics/monthly') 코드를 여기에 구현
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    },
    getProgramStatistics: async (req, res) => {
        // server.js.old의 app.get('/api/statistics/program') 코드를 여기에 구현
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    }
};

