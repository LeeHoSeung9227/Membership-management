document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = loginForm.querySelector('input[name="username"]').value;
        const password = loginForm.querySelector('input[name="password"]').value;
        const keepLoggedIn = loginForm.querySelector('#keepLoggedIn').checked;

        try {
            console.log('로그인 시도중...');
            const result = await API.login(username, password);
            console.log('로그인 성공');
            
            if (keepLoggedIn) {
                // 로컬 스토리지에 저장 (브라우저를 닫아도 유지)
                localStorage.setItem('token', result.token);
                localStorage.setItem('isLoggedIn', 'true');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('isLoggedIn');
            } else {
                // 세션 스토리지에 저장 (브라우저를 닫으면 삭제)
                sessionStorage.setItem('token', result.token);
                sessionStorage.setItem('isLoggedIn', 'true');
                // 로컬 스토리지에서 기존 데이터 제거
                localStorage.removeItem('token');
                localStorage.removeItem('isLoggedIn');
            }
            
            setTimeout(() => {
                window.location.href = '홈페이지.html';
            }, 100);
            
        } catch (error) {
            console.error('로그인 실패:', error);
            alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
        }
    });

    const token = API.getToken();
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    
    if (token && isLoggedIn) {
        window.location.href = '홈페이지.html';
        return;
    }
});