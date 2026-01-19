document.addEventListener('DOMContentLoaded', () => {
    const usernameForm = document.getElementById('username-form');
    const passwordForm = document.getElementById('password-form');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');

    usernameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        usernameError.style.display = 'none';
        
        const currentPassword = document.getElementById('current-password-username').value;
        const newUsername = document.getElementById('new-username').value;

        try {
            // 현재 비밀번호 확인
            const verifyResponse = await fetch(`${API.API_BASE_URL}/verify-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API.getToken()}`
                },
                body: JSON.stringify({ current_password: currentPassword })
            });

            if (!verifyResponse.ok) {
                const data = await verifyResponse.json();
                throw new Error(data.message || '현재 비밀번호가 올바르지 않습니다.');
            }

            // 아이디 변경
            const response = await fetch(`${API.API_BASE_URL}/change-username`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API.getToken()}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_username: newUsername
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '아이디 변경에 실패했습니다.');
            }

            alert('아이디가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
            API.logout();
        } catch (error) {
            usernameError.textContent = error.message;
            usernameError.style.display = 'block';
        }
    });

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        passwordError.style.display = 'none';

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        try {
            if (newPassword !== confirmPassword) {
                throw new Error('새 비밀번호가 일치하지 않습니다.');
            }

            if (newPassword.length < 8) {
                throw new Error('비밀번호는 최소 8자 이상이어야 합니다.');
            }

            // 현재 비밀번호 확인
            const verifyResponse = await fetch(`${API.API_BASE_URL}/verify-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API.getToken()}`
                },
                body: JSON.stringify({ current_password: currentPassword })
            });

            if (!verifyResponse.ok) {
                const data = await verifyResponse.json();
                throw new Error(data.message || '현재 비밀번호가 올바르지 않습니다.');
            }

            // 비밀번호 변경
            const response = await fetch(`${API.API_BASE_URL}/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API.getToken()}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '비밀번호 변경에 실패했습니다.');
            }

            alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
            API.logout();
        } catch (error) {
            passwordError.textContent = error.message;
            passwordError.style.display = 'block';
        }
    });
});

// 비밀번호 표시/숨김 토글 함수
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const img = button.querySelector('img');
    
    if (input.type === 'password') {
        input.type = 'text';
        img.src = 'image/eye-slash.png';
        img.alt = '비밀번호 숨기기';
    } else {
        input.type = 'password';
        img.src = 'image/eye.png';
        img.alt = '비밀번호 보기';
    }
}

function toggleSidebar() { 
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}