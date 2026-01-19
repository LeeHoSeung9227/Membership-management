const API = {
    API_BASE_URL: 'https://membership-management-production.up.railway.app/api',

    // Token management
    getToken: () => {
        const sessionToken = sessionStorage.getItem('token');
        if (sessionToken) {
            if (sessionStorage.getItem('isLoggedIn')) {
                return sessionToken;
            }
        }
        
        const localToken = localStorage.getItem('token');
        if (localToken) {
            if (localStorage.getItem('isLoggedIn')) {
                return localToken;
            }
        }
        
        return null;
    },
    setToken: (token) => localStorage.setItem('token', token),
    removeToken: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('isLoggedIn');
    },


    // API calls with authentication
    apiCall: async (endpoint, options = {}) => {
        const token = API.getToken();
        
        if (!token && !endpoint.includes('login')) {
            window.location.href = '/로그인.html';
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };

            console.log('API 요청:', endpoint, '헤더:', headers);

            const response = await fetch(`${API.API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...headers,
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    API.removeToken();
                    window.location.href = '/로그인.html';
                    throw new Error('인증이 만료되었습니다.');
                }
                if (data && data.message) {
                    throw new Error(data.message);
                }
                throw new Error(`API 요청 실패: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API 호출 에러:', error);
            throw error;
        }
    },

    // Auth APIs
    login: async (username, password) => {
        try {
            console.log('로그인 시도:', username);
            const response = await fetch(`${API.API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
    
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '로그인에 실패했습니다');
            }
    
            console.log('로그인 성공, 토큰 수신');
            API.setToken(data.token);
            return data;
        } catch (error) {
            console.error('로그인 처리 중 오류:', error);
            throw error;
        }
    },

    verifyPassword: async (currentPassword) => {
        return API.apiCall('/verify-password', {
            method: 'POST',
            body: JSON.stringify({ current_password: currentPassword })
        });
    },
    
    changePassword: async (currentPassword, newPassword) => {
        return API.apiCall('/change-password', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
    },
    
    changeUsername: async (currentPassword, newUsername) => {
        return API.apiCall('/change-username', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_username: newUsername
            })
        });
    },

    // Member APIs
    getMembers: async (includeHidden = false) => {
        try {
            const response = await API.apiCall(`/members?includeHidden=${includeHidden}`);
            return response;
        } catch (error) {
            console.error('회원 목록 조회 실패:', error);
            throw error;
        }
    },

    updateMemberVisibility: async (memberId, hidden) => {
        return API.apiCall(`/members/${memberId}/visibility`, {
            method: 'PUT',
            body: JSON.stringify({ hidden })
        });
    },

    createMember: async (memberData) => {
        return API.apiCall('/members', {
            method: 'POST',
            body: JSON.stringify(memberData)
        });
    },

    updateMember: async (id, memberData) => {
        return API.apiCall(`/members/enrollment/${id}`, {
            method: 'PUT',
            body: JSON.stringify(memberData)
        });
    },

    updateMemberBasicInfo: async (id, memberData) => {
        return API.apiCall(`/members/${id}/basic`, {
            method: 'PUT',
            body: JSON.stringify(memberData)
        });
    },

    getMemberPaymentLogs: async (memberId) => {
        try {
            return await API.apiCall(`/members/${memberId}/payment-logs`);
        } catch (error) {
            console.error('결제 로그 조회 실패:', error);
            throw error;
        }
    },

    deleteMember: async (enrollmentId) => {
        return API.apiCall(`/members/enrollment/${enrollmentId}`, {
            method: 'DELETE'
        });
    },

    getMember: async (id) => {
        try {
            const response = await API.apiCall(`/members/enrollment/${id}`);
            return response;
        } catch (error) {
            console.error('회원 조회 실패:', error);
            throw error;
        }
    },

    getMemberBasicInfo: async (id) => {
        try {
            const response = await API.apiCall(`/members/${id}/basic`);
            return response;
        } catch (error) {
            console.error('회원 기본 정보 조회 실패:', error);
            throw error;
        }
    },

    addMemberProgram: async (enrollmentId, programData) => {
        try {
            return await API.apiCall(`/members/enrollment/${enrollmentId}/programs`, {
                method: 'POST',
                body: JSON.stringify(programData)
            });
        } catch (error) {
            console.error('프로그램 추가 실패:', error);
            throw error;
        }
    },

    deleteEnrollment: async (enrollmentId) => {
        return API.apiCall(`/enrollments/${enrollmentId}`, {
            method: 'DELETE'
        });
    },

    // Attendance APIs
    checkAttendance: async (enrollmentData) => {
        return API.apiCall('/attendance', {
            method: 'POST',
            body: JSON.stringify({
                enrollment_id: enrollmentData.enrollment_id,
                attendance_date: enrollmentData.attendance_date,
                is_present: enrollmentData.is_present
            })
        });
    },

    getAttendanceList: async (params) => {
        try {
            const queryString = new URLSearchParams({
                month: params.month,
                year: params.year,
                program_id: params.program_id,
                includeHidden: 'false'
            }).toString();
            
            const response = await API.apiCall(`/attendance?${queryString}`);
            console.log('출석 데이터 응답:', response);  // 디버깅용
            return response;
        } catch (error) {
            console.error('출석 데이터 조회 실패:', error);
            throw error;
        }
    },

    // Instructor APIs
    getInstructors: async () => {
        return API.apiCall('/instructors');
    },

    createInstructor: async (instructorData) => {
        return API.apiCall('/instructors', {
            method: 'POST',
            body: JSON.stringify(instructorData)
        });
    },

    updateInstructor: async (id, instructorData) => {
        return API.apiCall(`/instructors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(instructorData)
        });
    },

    deleteInstructor: async (id) => {
        return API.apiCall(`/instructors/${id}`, {
            method: 'DELETE'
        });
    },

    getInstructor: async (id) => {
        return API.apiCall(`/instructors/${id}`);
    },

    // Dashboard APIs
    getDashboardStats: async () => {
        return API.apiCall('/dashboard');
    },

    // Statistics APIs
    getMonthlyStats: async () => {
        return API.apiCall('/statistics/monthly');
    },

    getProgramStats: async (year) => {
    return API.apiCall(`/statistics/program?year=${year}`);
    },

    // Programs APIs
    getPrograms: async () => {
        try {
            const response = await API.apiCall('/programs');
            console.log('프로그램 목록 원본 응답:', response);
            return response.map(program => ({
                ...program,
                monthlyPrice: parseInt(program.monthly_price),
                perClassPrice: parseInt(program.per_class_price)
            }));
        } catch (error) {
            console.error('프로그램 목록 조회 실패:', error);
            throw error;
        }
    },

    createProgram: async (programData) => {
        try {
            // 데이터 유효성 검사 추가
            if (!programData.classes_per_week || programData.classes_per_week < 1) {
                throw new Error('주간 수업 횟수는 1 이상이어야 합니다.');
            }
    
            return await API.apiCall('/programs', {
                method: 'POST',
                body: JSON.stringify({
                    name: programData.name,
                    instructor_name: programData.instructor_name || null,
                    monthly_price: parseInt(programData.monthly_price) || 0,
                    per_class_price: parseInt(programData.per_class_price) || 0,
                    classes_per_week: parseInt(programData.classes_per_week),
                    schedules: programData.schedules,
                    details: programData.details,
                    color: programData.color
                })
            });
        } catch (error) {
            console.error('프로그램 등록 실패:', error);
            throw error;
        }
    },

    getProgram: async (programId) => {
        try {
            return await API.apiCall(`/programs/${programId}`);
        } catch (error) {
            console.error('프로그램 조회 실패:', error);
            throw error;
        }
    },
    
    updateProgram: async (programId, programData) => {
        try {
            return await API.apiCall(`/programs/${programId}`, {
                method: 'PUT',
                body: JSON.stringify(programData)
            });
        } catch (error) {
            console.error('프로그램 수정 실패:', error);
            throw error;
        }
    },

    deleteProgram: async (programId) => {
        try {
            return await API.apiCall(`/programs/${programId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('프로그램 삭제 실패:', error);
            throw error;
        }
    },

    deleteAllPrograms: async () => {
        try {
            return await API.apiCall('/programs', {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('프로그램 전체 삭제 실패:', error);
            throw error;
        }
    },

    // Error Handler
    handleApiError: (error) => {
        console.error('API 에러:', error);
        
        if (error.message.includes('인증')) {
            API.removeToken();
            window.location.href = '/로그인.html';
        }
        
        alert(error.message || '서버 오류가 발생했습니다.');
    },

    // Utility Functions
    checkAuthStatus: () => {
        const token = API.getToken();
        if (!token) {
            window.location.href = '/로그인.html';
            return false;
        }
        return true;
    },

    logout: () => {
        API.removeToken();
        window.location.href = '/로그인.html';
    }
};

// Add event listener for global error handling
window.addEventListener('unhandledrejection', (event) => {
    API.handleApiError(event.reason);
});

// Make API globally available
window.API = API;