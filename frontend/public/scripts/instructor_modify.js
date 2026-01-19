let currentInstructorId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentInstructorId = urlParams.get('id');
    
    if (!currentInstructorId) {
        alert('잘못된 접근입니다.');
        window.location.href = '선생님.html';
        return;
    }
    
    try {
        const instructor = await API.getInstructor(currentInstructorId);
        fillInstructorData(instructor);
        setupEventListeners();
    } catch (error) {
        console.error('선생님 정보 로드 실패:', error);
        API.handleApiError(error);
    }
});

function fillInstructorData(instructor) {
    document.getElementById('name').value = instructor.name || '';
    document.getElementById('phone').value = instructor.phone || '';
    document.getElementById('salary').value = instructor.salary || '';
}

function setupEventListeners() {
    const form = document.getElementById('instructor-form');
    const deleteBtn = document.getElementById('delete-btn');
    
    form.addEventListener('submit', handleSubmit);
    deleteBtn.addEventListener('click', handleDelete);
}

async function handleSubmit(event) {
    event.preventDefault();
    
    try {
        const instructorData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            salary: parseInt(document.getElementById('salary').value)
        };
        
        await API.updateInstructor(currentInstructorId, instructorData);
        alert('선생님 정보가 성공적으로 수정되었습니다.');
        window.location.href = '선생님관리.html';
    } catch (error) {
        console.error('선생님 정보 수정 실패:', error);
        alert('선생님 정보 수정에 실패했습니다. 다시 시도해주세요.');
    }
}

async function handleDelete() {
    if (!confirm('정말로 이 선생님을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        await API.deleteInstructor(currentInstructorId);
        alert('선생님이 성공적으로 삭제되었습니다.');
        window.location.href = '선생님관리.html';
    } catch (error) {
        console.error('선생님 삭제 실패:', error);
        alert('선생님 삭제에 실패했습니다. 다시 시도해주세요.');
    }
}