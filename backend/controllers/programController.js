const pool = require('../config/database');

module.exports = {
    getAllPrograms: async (req, res) => {
        // server.js.old의 app.get('/api/programs') 코드를 여기에 구현
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    },
    getProgramById: async (req, res) => {
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    },
    createProgram: async (req, res) => {
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    },
    updateProgram: async (req, res) => {
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    },
    deleteProgram: async (req, res) => {
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    },
    deleteAllPrograms: async (req, res) => {
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    }
};

