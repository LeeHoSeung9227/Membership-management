document.addEventListener('DOMContentLoaded', async () => {
    initializeDateFields();
    await loadPrograms();
    setupEventListeners();
});

const prices = {
    monthly: {},
    perClass: {}
};

let programs = [];
let selectedPaymentStatus = 'unpaid';

function setPaymentStatus(status) {
    selectedPaymentStatus = status;
    
    // 선택된 버튼 스타일 변경
    const buttons = document.querySelectorAll('.payment-status button');
    buttons.forEach(button => {
        if (button.dataset.status === status) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
}

function setupEventListeners() {
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await registerMember();
        });
    }

    const birthdateInput = document.getElementById('birthdate');
    if (birthdateInput) {
        birthdateInput.addEventListener('change', function() {
            const age = calculateAge(this.value);
            document.getElementById('age').value = age;
        });
    }
}

function initializeDateFields() {
    const birthdateInput = document.getElementById('birthdate');
    const startDateInput = document.getElementById('start_date');
    const today = new Date();
    
    // 생년월일은 오늘 이전만 선택 가능
    birthdateInput.max = today.toISOString().split('T')[0];
    
    // 시작일은 오늘부터 한 달 후까지만 선택 가능
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    
    startDateInput.min = today.toISOString().split('T')[0];
    startDateInput.max = oneMonthLater.toISOString().split('T')[0];
    startDateInput.value = today.toISOString().split('T')[0];
}

async function loadPrograms() {
    try {
        programs = await API.getPrograms();
        const programSelect = document.getElementById('program');
        programSelect.innerHTML = '<option value="">선택하세요</option>';
        
        programs.forEach(prog => {
            const option = document.createElement('option');
            option.value = prog.id;
            option.textContent = prog.name;
            programSelect.appendChild(option);
        });
    } catch (error) {
        console.error('프로그램 목록 로드 실패:', error);
        API.handleApiError(error);
    }
}

function updateProgramSelection() {
    calculateAmount();
}

function setSubscription(value) {
    const customInputGroup = document.querySelector('.custom-input-group');
    const subscriptionType = document.getElementById('subscription-type');
    const inputField = document.getElementById('custom-subscription');
    
    customInputGroup.style.display = 'flex';
    
    // 값에서 숫자와 단위 분리
    const match = value.match(/^(\d+)(개월|회)$/);
    if (match) {
        const [, number, unit] = match;
        inputField.value = number;
        
        // 단위에 따라 select 값 설정
        if (unit === '개월') {
            subscriptionType.value = 'month';
        } else if (unit === '회') {
            subscriptionType.value = 'class';
        }
    }
    
    updateSubscriptionPlaceholder();
    calculateAmount();
}

function enableCustomInput() {
    const customInputGroup = document.querySelector('.custom-input-group');
    const inputField = document.getElementById('custom-subscription');
    
    customInputGroup.style.display = 'flex';
    inputField.value = '';
    updateSubscriptionPlaceholder();
    document.getElementById('amount-display').innerText = '결제 금액: 0원';
}

function updateSubscriptionPlaceholder() {
    const subscriptionType = document.getElementById('subscription-type');
    const inputField = document.getElementById('custom-subscription');
    
    if (subscriptionType.value === 'month') {
        inputField.placeholder = '개월 수 입력';
    } else {
        inputField.placeholder = '횟수 입력';
    }
}

function calculateAmount() {
    const programSelect = document.getElementById('program');
    const subscriptionType = document.getElementById('subscription-type');
    const subscriptionInput = document.getElementById('custom-subscription');
    const amountDisplay = document.getElementById('amount-display');
    
    if (!programSelect.value || !subscriptionInput.value) {
        amountDisplay.innerText = '결제 금액: 0원';
        return;
    }

    const program = programs.find(p => p.id.toString() === programSelect.value);
    if (!program) return;

    let totalAmount = 0;
    const quantity = parseInt(subscriptionInput.value);
    
    // 구독 유형에 따라 다른 가격 계산
    if (subscriptionType.value === 'month') {
        totalAmount = quantity * program.monthly_price;
    } else {
        totalAmount = quantity * program.per_class_price;
    }

    amountDisplay.innerText = `결제 금액: ${totalAmount.toLocaleString()}원`;
    return totalAmount;
}

function calculateAge(birthdate) {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

async function registerMember(e) {
    if (e) {
        e.preventDefault();
    }

    const formData = {
        name: document.getElementById('name').value.trim(),
        gender: document.getElementById('gender').value,
        birthdate: document.getElementById('birthdate').value,
        age: document.getElementById('age').value,
        address: document.getElementById('address').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        program_id: document.getElementById('program').value,
        start_date: document.getElementById('start_date').value,
        payment_status: selectedPaymentStatus,
        duration_months: 0,
        total_classes: 0
    };

    const subscriptionType = document.getElementById('subscription-type');
    const subscriptionInput = document.getElementById('custom-subscription').value;

    // 필수 입력 필드 검증
    const missingFields = [];
    if (!formData.name) missingFields.push('이름');
    if (!formData.gender) missingFields.push('성별');
    if (!formData.birthdate) missingFields.push('생년월일');
    if (!formData.age) missingFields.push('나이');
    if (!formData.address) missingFields.push('주소');
    if (!formData.phone) missingFields.push('전화번호');
    if (!formData.program_id) missingFields.push('프로그램');
    if (!formData.start_date) missingFields.push('시작일');
    if (!formData.payment_status) missingFields.push('결제상태');
    if (!subscriptionInput) missingFields.push('구독 기간/횟수');

    if (missingFields.length > 0) {
        alert(`다음 정보를 입력해주세요:\n${missingFields.join('\n')}`);
        return;
    }

    try {
        // 구독 유형에 따른 데이터 설정
        if (subscriptionType.value === 'month') {
            formData.duration_months = parseInt(subscriptionInput);
            formData.total_classes = 0;
        } else {
            formData.duration_months = 0;
            formData.total_classes = parseInt(subscriptionInput);
        }

        const response = await API.createMember(formData);
        
        if (response) {
            alert('회원이 성공적으로 등록되었습니다.');
            window.location.href = '회원관리.html';
        }
    } catch (error) {
        console.error('회원 등록 실패:', error);
        alert('회원 등록에 실패했습니다. 다시 시도해주세요.');
    }
}