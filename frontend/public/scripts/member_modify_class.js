let selectedProgram = '';
let selectedPaymentStatus = 'unpaid';
let programs = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initializeForm();
    setupEventListeners();
});

async function initializeForm() {
    try {
        programs = await API.getPrograms();
        updateProgramSelect();
        
        const urlParams = new URLSearchParams(window.location.search);
        const memberId = urlParams.get('id');
        
        if (memberId) {
            const memberData = await API.getMember(memberId);
            if (memberData) {
                fillMemberData(memberData);
            } else {
                throw new Error('회원 정보를 찾을 수 없습니다.');
            }
        } else {
            throw new Error('회원 ID가 제공되지 않았습니다.');
        }
    } catch (error) {
        console.error('초기화 실패:', error);
        alert('데이터 로드에 실패했습니다: ' + error.message);
    }
}

function updateProgramSelect() {
    const programSelect = document.getElementById('program');
    programSelect.innerHTML = '<option value="">선택하세요</option>';
    
    programs.forEach(prog => {
        const option = document.createElement('option');
        option.value = prog.id;
        option.textContent = prog.name;
        programSelect.appendChild(option);
    });
}

function fillMemberData(memberData) {
    const programSelect = document.getElementById('program');
    programSelect.innerHTML = `<option value="${memberData.program_id}">${memberData.program_name}</option>`;
    programSelect.value = memberData.program_id;
    programSelect.disabled = true; 
    
    document.getElementById('start_date').value = memberData.start_date ? memberData.start_date.split('T')[0] : '';
    
    // 결제 상태 설정
    if (memberData.payment_status) {
        setPaymentStatus(memberData.payment_status);
    }
    
    // 구독 정보 설정
    const subscriptionType = document.getElementById('subscription-type');
    const customSubscription = document.getElementById('custom-subscription');
    const customInputGroup = document.querySelector('.custom-input-group');
    
    customInputGroup.style.display = 'flex';
    
    // 구독 유형 설정
    if (memberData.total_classes > 0) {
        console.log('Setting class subscription:', memberData.total_classes);
        subscriptionType.value = 'class';
        customSubscription.value = memberData.total_classes;
        updateSubscriptionPlaceholder();
    } else if (memberData.duration_months > 0) {
        console.log('Setting month subscription:', memberData.duration_months);
        subscriptionType.value = 'month';
        customSubscription.value = memberData.duration_months;
        updateSubscriptionPlaceholder();
    }

    // 금액 계산
    calculateAmount();
}

function updateProgramSelection() {
    selectedProgram = document.getElementById('program').value;
    calculateAmount();
}

function setPaymentStatus(status) {
    selectedPaymentStatus = status;
    
    const buttons = document.querySelectorAll('.payment-status button');
    buttons.forEach(button => {
        if (button.dataset.status === status) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
}

function setSubscription(value) {
    const customInputGroup = document.querySelector('.custom-input-group');
    const subscriptionType = document.getElementById('subscription-type');
    const inputField = document.getElementById('custom-subscription');
    
    customInputGroup.style.display = 'flex';
    
    const match = value.match(/^(\d+)(개월|회)$/);
    if (match) {
        const [, number, unit] = match;
        inputField.value = number;
        
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
    const customSubscription = document.getElementById('custom-subscription');
    
    customSubscription.placeholder = subscriptionType.value === 'month' ? '개월 수 입력' : '횟수 입력';
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
    let quantity = parseInt(subscriptionInput.value);
    
    if (subscriptionType.value === 'month') {
        totalAmount = quantity * program.monthly_price;
        const totalClasses = quantity * 4 * program.classes_per_week;
        subscriptionInput.setAttribute('data-total-classes', totalClasses);
    } else {
        totalAmount = quantity * program.per_class_price;
        subscriptionInput.setAttribute('data-total-classes', quantity);
    }

    amountDisplay.innerText = `결제 금액: ${totalAmount.toLocaleString()}원`;
    return totalAmount;
}

async function updateMember(event) {
    event.preventDefault();
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const memberId = urlParams.get('id');
        const subscriptionType = document.getElementById('subscription-type');
        const subscriptionInput = document.getElementById('custom-subscription');
        
        if (!memberId) {
            throw new Error('회원 ID를 찾을 수 없습니다.');
        }

        const formData = {
            program_id: document.getElementById('program').value,
            start_date: document.getElementById('start_date').value,
            payment_status: selectedPaymentStatus,
            duration_months: 0,
            total_classes: 0
        };

        const missingFields = [];
        if (!formData.program_id) {
            alert('수업을 선택해주세요.');
            return;
        }
        if (!formData.start_date) missingFields.push('시작일');
        if (!formData.payment_status) missingFields.push('결제상태');
        if (!subscriptionInput || !subscriptionInput.value) {
            alert('구독 기간/횟수를 입력해주세요.');
            return;
        }

        if (missingFields.length > 0) {
            alert(`다음 정보를 입력해주세요:\n${missingFields.join('\n')}`);
            return;
        }

        // 구독 유형에 따른 데이터 설정
        if (subscriptionType.value === 'month') {
            formData.duration_months = parseInt(subscriptionInput.value);
            formData.total_classes = 0;
        } else {
            formData.duration_months = 0;
            formData.total_classes = parseInt(subscriptionInput.value);
        }

        const response = await API.updateMember(memberId, formData);
        
        if (response.success) {
            alert('수업 정보가 성공적으로 수정되었습니다.');
            window.location.href = '/회원관리.html';
        } else {
            throw new Error(response.message || '수업 정보 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('수업 정보 수정 실패:', error);
        alert(error.message || '수업 정보 수정에 실패했습니다. 다시 시도해주세요.');
    }
}

async function extendProgram() {
  try {
      const urlParams = new URLSearchParams(window.location.search);
      const memberId = urlParams.get('id');
      const subscriptionType = document.getElementById('subscription-type');
      const subscriptionInput = document.getElementById('custom-subscription');
      
      const programData = {
          member_id: memberId,
          program_id: document.getElementById('program').value,
          start_date: document.getElementById('start_date').value,
          payment_status: selectedPaymentStatus,
          is_extension: true
      };

      if (!programData.start_date) {
        alert('등록 날짜를 선택해주세요.');
        return;
      }
      if (!programData.payment_status) {
        alert('결제 상태를 골라주세요.');
        return;
      }
      if (!subscriptionInput || !subscriptionInput.value) {
        alert('구독 기간/횟수를 입력해주세요.');
        return;
      }

      if (subscriptionType.value === 'month') {
          programData.duration_months = parseInt(subscriptionInput.value);
          programData.total_classes = null;
      } else {
          programData.duration_months = null;
          programData.total_classes = parseInt(subscriptionInput.value);
      }

      await API.addMemberProgram(memberId, programData);
      alert('수업이 성공적으로 연장되었습니다.');
      window.location.href = '/회원관리.html';
  } catch (error) {
      console.error('수업 연장 실패:', error);
      alert('수업 연장에 실패했습니다. 다시 시도해주세요.');
  }
}

async function deleteEnrollment() {
    if (confirm('이 수업을 삭제하시겠습니까?')) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const enrollmentId = urlParams.get('id');
            
            if (!enrollmentId) {
                throw new Error('수업 ID를 찾을 수 없습니다.');
            }

            await API.deleteEnrollment(enrollmentId);
            alert('수업이 성공적으로 삭제되었습니다.');
            window.location.href = '/회원관리.html';
        } catch (error) {
            console.error('수업 삭제 실패:', error);
            alert('수업 삭제에 실패했습니다: ' + error.message);
        }
    }
}

function setupEventListeners() {
    // 수업 삭제 버튼 이벤트
    const deleteEnrollmentButton = document.getElementById('delete-enrollment-btn');
    if (deleteEnrollmentButton) {
        deleteEnrollmentButton.addEventListener('click', deleteEnrollment);
    }

    // 수업 연장 버튼 이벤트
    const addProgramButton = document.getElementById('extend-program-btn');
    if (addProgramButton) {
        addProgramButton.addEventListener('click', extendProgram);
    }
}