document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('instructor-form');
    form.addEventListener('submit', handleSubmit);
});

async function handleSubmit(event) {
    event.preventDefault();
    
    try {
        const instructorData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            salary: parseInt(document.getElementById('salary').value)
        };
        
        await API.createInstructor(instructorData);
        alert('강사가 성공적으로 등록되었습니다.');
        window.location.href = '강사관리.html';
    } catch (error) {
        console.error('강사 등록 실패:', error);
        alert('강사 등록에 실패했습니다. 다시 시도해주세요.');
    }
}