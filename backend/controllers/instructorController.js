const pool = require('../config/database');

module.exports = {
    getAllInstructors: async (req, res) => {
        // server.js.old의 app.get('/api/instructors') 코드를 여기에 구현
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    },
    getInstructorById: async (req, res) => {
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    },
    createInstructor: async (req, res) => {
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    },
    updateInstructor: async (req, res) => {
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    },
    deleteInstructor: async (req, res) => {
        res.status(501).json({ message: '구현 필요 - server.js.old 참조' });
    }
};

