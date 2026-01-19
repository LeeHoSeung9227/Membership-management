document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    try {
        console.log('API 객체 확인:', API);
        await loadMembers();
        setupEventListeners();

        const modalOverlay = document.querySelector('.modal-overlay');
        const memberInfoModal = document.querySelector('.member-info-modal');
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeModal);
        }
        
        if (memberInfoModal) {
            memberInfoModal.addEventListener('click', (e) => e.stopPropagation());
        }

        
    } catch (error) {
        console.error('회원 데이터 로드 실패:', error);
        API.handleApiError(error);
    }
});

let showingHiddenMembers = false;
// 회원 데이터 가져오기
async function loadMembers(showHidden = false) {
    try {
        console.log('loadMembers 함수 실행, showHidden:', showHidden);
        const members = await API.getMembers(showHidden);
        updateTable(members);
        updateCards(members);
    } catch (error) {
        console.error('회원 목록 조회 실패:', error);
        throw error;
    }
}

function updateTable(members) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    const paginatedMembers = paginateMembers(members);
    
    paginatedMembers.forEach(member => {
        const tr = document.createElement('tr');
        
        const programs = member.programs || [];
        const sortedPrograms = [...programs].sort((a, b) => 
            (a.remaining_days || 0) - (b.remaining_days || 0)
        );

        let nameColor = '';
        let tooltipText = '';

        const zeroDaysProgram = sortedPrograms.find(p => p.remaining_days === 0);
        const lowestDaysProgram = sortedPrograms.find(p => p.remaining_days > 0 && p.remaining_days <= 3);
        
        if (zeroDaysProgram) {
            nameColor = 'red';
            tooltipText = `${zeroDaysProgram.name} 수업의 결제일입니다.`;
        } else if (lowestDaysProgram) {
            nameColor = '#E56736';
            tooltipText = `${lowestDaysProgram.name} 수업의 남은 일수가 ${lowestDaysProgram.remaining_days}회입니다.`;
        }
        
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT') {
                return;
            }
            showMemberInfo(member);
        });

        if (tooltipText) {
            tr.style.position = 'relative';
            setupTooltip(tr, tooltipText);
        }

        const nameCell = document.createElement('td');
        nameCell.style.color = nameColor;
        nameCell.textContent = member.name || '-';
        tr.appendChild(nameCell);

        const phoneCell = document.createElement('td');
        phoneCell.textContent = member.phone || '-';
        tr.appendChild(phoneCell);
        
        const programCell = document.createElement('td');
        
        if (programs.length > 1) {
            const select = document.createElement('select');
            select.className = 'program-select';
            
            programs.forEach(program => {
                const option = document.createElement('option');
                option.value = program.id;
                option.textContent = program.name;
                select.appendChild(option);
            });
            
            select.addEventListener('change', (e) => {
                e.stopPropagation();
                const selectedProgram = programs.find(p => p.id === parseInt(e.target.value));
                updateProgramDetails(tr, selectedProgram);
            });
            
            programCell.appendChild(select);
        } else if (programs.length === 1) {
            programCell.textContent = programs[0].name || '-';
        } else {
            programCell.textContent = '-';
        }
        tr.appendChild(programCell);
 
        const initialProgram = programs[0] || {};
        appendProgramDetails(tr, initialProgram);
 
        tbody.appendChild(tr);
    });
    updatePagination(members.length);
}

function updateCards(members) {
    const cardContainer = document.querySelector('.card-container');
    cardContainer.innerHTML = ''; // 기존 카드 초기화

    const paginatedMembers = paginateMembers(members);

    paginatedMembers.forEach(member => {
        const programs = member.programs || [];
        let selectedProgram = programs[0] || {};

        // 카드 생성
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-name', member.name.toLowerCase()); // 이름을 소문자로 저장
        card.style.marginBottom = '20px'; // 카드 간격 추가

        // 카드 내용 컨테이너
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';

        // 카드 내용 업데이트 함수
        const updateCardContent = (program) => {
            cardContent.innerHTML = `
                <h3>${member.name || '-'}</h3>
                <div style="display: flex; align-items: center;">
                    <p style="margin: 0; margin-right: 10px;">수강 정보:</p>
                    <select class="program-select" style="width: auto;">
                        ${programs.map(p => `<option value="${p.id}" ${p.id === program.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                    </select>
                </div>
                <p>남은 횟수: <span style="color: ${
                    program.remaining_days <= 0 ? 'red' : 
                    program.remaining_days <= 3 ? '#E56736' : ''
                }">${program.remaining_days === undefined ? '-' : `${program.remaining_days}일`}</span></p>
            `;

            const select = cardContent.querySelector('.program-select');
            select.addEventListener('change', (e) => {
                const selectedProgramId = parseInt(e.target.value);
                selectedProgram = programs.find(p => p.id === selectedProgramId) || {};
                updateCardContent(selectedProgram);
            });
        };

        // 버튼 컨테이너 생성
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.marginTop = '10px';

        // 연장/삭제 버튼
        const editButton = document.createElement('button');
        editButton.className = 'btn-plus';
        editButton.textContent = '연장 / 삭제';
        editButton.addEventListener('click', () => {
            location.href = `회원수업수정.html?id=${selectedProgram.id}`;
        });

        // 수업 추가 버튼
        const addButton = document.createElement('button');
        addButton.className = 'btn-plus';
        addButton.textContent = '수업 추가';
        addButton.addEventListener('click', () => {
            location.href = `회원수업추가.html?id=${selectedProgram.id}`;
        });

        // 버튼 추가
        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(addButton);

        // 초기 카드 내용 설정
        updateCardContent(selectedProgram);

        // 카드에 요소 추가
        card.appendChild(cardContent);
        card.appendChild(buttonContainer);
        cardContainer.appendChild(card);
    });
}



function appendProgramDetails(row, program) {
    const remaining = program.remaining_days;
    const remainingDisplay = remaining !== undefined && remaining !== null ? `${remaining}일` : '-';
    const remainingColor = remaining <= 0 ? 'red' : 
                          remaining <= 3 ? '#E56736' : '';
    
    const subscriptionCell = document.createElement('td');
    subscriptionCell.textContent = formatSubscription(program);
    row.appendChild(subscriptionCell);
 
    const amountCell = document.createElement('td');
    const displayAmount = program.original_amount || calculateAmount(program);
    amountCell.textContent = formatCurrency(displayAmount);
    row.appendChild(amountCell);
    
    const remainingCell = document.createElement('td');
    remainingCell.textContent = remainingDisplay;
    remainingCell.style.color = remainingColor;
    row.appendChild(remainingCell);
 
    const paymentCell = document.createElement('td');
    paymentCell.textContent = formatPaymentStatus(program.payment_status);
    row.appendChild(paymentCell);
 
    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(program.start_date) || '-';
    row.appendChild(dateCell);
 
    const editCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.className = 'btn-plus';
    editButton.textContent = '연장 / 삭제';
    editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        location.href = `회원수업수정.html?id=${program.id}`;
    });
    editCell.appendChild(editButton);
    row.appendChild(editCell);

    const addCell = document.createElement('td');
    const addButton = document.createElement('button');
    addButton.className = 'btn-plus';
    addButton.textContent = '추가';
    addButton.addEventListener('click', (e) => {
        e.stopPropagation();
        location.href = `회원수업추가.html?id=${program.id}`;
    });
    addCell.appendChild(addButton);
    row.appendChild(addCell);
}

 function updateProgramDetails(row, selectedProgram) {
    const existingCells = row.cells;
    const startIndex = 2;
    
    const programCell = existingCells[startIndex];
    const programSelect = programCell.querySelector('select');
    if (programSelect) {
        programSelect.value = selectedProgram.id;
    }
    
    if (existingCells[startIndex + 1]) {
        existingCells[startIndex + 1].textContent = formatSubscription(selectedProgram);
    }

    if (existingCells[startIndex + 2]) {
        existingCells[startIndex + 2].textContent = formatCurrency(selectedProgram.original_amount || calculateAmount(selectedProgram));
    }

    // 남은 일수 셀 업데이트
    if (existingCells[startIndex + 3]) {
        const remainingCell = existingCells[startIndex + 3];
        const remaining = selectedProgram.remaining_days;
        remainingCell.textContent = remaining !== undefined && remaining !== null ? `${remaining}일` : '-';
        remainingCell.style.color = remaining <= 0 ? 'red' : 
                                  remaining <= 3 ? '#E56736' : '';
    }

    // 결제 상태 셀 업데이트
    if (existingCells[startIndex + 4]) {
        existingCells[startIndex + 4].textContent = formatPaymentStatus(selectedProgram.payment_status);
    }

    // 회원 등록일 셀 업데이트
    if (existingCells[startIndex + 5]) {
        existingCells[startIndex + 5].textContent = formatDate(selectedProgram.start_date) || '-';
    }

    // 수정/연장 버튼 셀 업데이트
    if (existingCells[startIndex + 6]) {
        const modifyButton = existingCells[startIndex + 6].querySelector('button');
        if (modifyButton) {
            modifyButton.onclick = () => location.href = `회원수업수정.html?id=${selectedProgram.id}`;
        }
    }

    // 추가 버튼 셀 업데이트
    if (existingCells[startIndex + 7]) {
        const addButton = existingCells[startIndex + 7].querySelector('button');
        if (addButton) {
            addButton.onclick = () => location.href = `회원수업추가.html?id=${selectedProgram.id}`;
        }
    }
}

let currentMemberId = null;
async function showMemberInfo(member) {
    currentMemberId = member.id;
    
    const nameInput = document.getElementById('modal-name');
    const phoneInput = document.getElementById('modal-phone');
    const birthdateInput = document.getElementById('modal-birthdate');
    const ageInput = document.getElementById('modal-age');
    const genderInput = document.getElementById('modal-gender');
    const addressInput = document.getElementById('modal-address');
    const paymentLogContainer = document.getElementById('modal-payment-logs');

    nameInput.value = '';
    phoneInput.value = '';
    birthdateInput.value = '';
    ageInput.value = '';
    genderInput.value = '';
    addressInput.value = '';
    paymentLogContainer.innerHTML = '<div class="loading">로딩 중...</div>'
    
    const modalHeader = document.querySelector('.member-info-modal .modal-header');
    const hideButton = document.createElement('button');
    hideButton.className = 'hide-member-btn';
    hideButton.textContent = member.hidden ? '회원 보이기' : '회원 숨김';
    hideButton.onclick = () => toggleMemberVisibility(member.id, !member.hidden);
    modalHeader.appendChild(hideButton);

    document.querySelector('.modal-overlay').style.display = 'block';
    document.querySelector('.member-info-modal').style.display = 'block';

    nameInput.value = member.name || '';
    phoneInput.value = member.phone || '';
    birthdateInput.value = member.birthdate ? member.birthdate.split('T')[0] : '';
    ageInput.value = member.age || '';
    genderInput.value = member.gender || '';
    addressInput.value = member.address || '';
    
    try {
        const paymentLogs = await API.getMemberPaymentLogs(member.id);
        
        // 결제 로그 컨테이너 스타일 설정
        paymentLogContainer.style.maxHeight = '150px';
        paymentLogContainer.style.overflowY = 'auto';
        paymentLogContainer.style.marginTop = '10px';
        paymentLogContainer.style.borderTop = '1px solid #ccc';
        paymentLogContainer.style.padding = '10px 0';
        
         paymentLogContainer.innerHTML = `
            <h4 style="margin: 0 0 10px 0;">결제 로그</h4>
            ${paymentLogs.length > 0 ? paymentLogs.map(log => `
                <div style="margin-bottom: 8px; font-size: 14px;">
                    <div style="color: #666;">
                        ${new Date(log.payment_date).toLocaleDateString('ko-KR')} 
                        ${log.is_extension ? '[연장]' : ''}
                    </div>
                    <div>
                        ${log.program_name} 
                        ${log.duration_months ? `${log.duration_months}개월` : `${log.total_classes}회`}
                        ${new Intl.NumberFormat('ko-KR').format(log.amount)}원
                    </div>
                </div>
            `).join('') : '<div style="color: #666;">결제 내역이 없습니다.</div>'}
        `;
    } catch (error) {
        console.error('결제 로그 로드 실패:', error);
        if (currentMemberId === member.id) {
            paymentLogContainer.innerHTML = '<p style="color: red;">결제 로그를 불러오는데 실패했습니다.</p>';
        }
    }
}

async function handleModalEdit() {
    try {
        if (!currentMemberId) {
            throw new Error('회원 ID를 찾을 수 없습니다.');
        }

        const formData = {
            name: document.getElementById('modal-name').value,
            gender: document.getElementById('modal-gender').value,
            birthdate: document.getElementById('modal-birthdate').value,
            age: document.getElementById('modal-age').value,
            address: document.getElementById('modal-address').value,
            phone: document.getElementById('modal-phone').value,
        };

        if (!formData.name) {
            alert('이름을 입력해주세요.');
            return;
        }
        if (!formData.phone) {
            alert('전화번호를 입력해주세요.');
            return;
        }
        if (!formData.birthdate) {
            alert('생일을 입력해주세요.');
            return;
        }
        if (!formData.age) {
            alert('나이을 입력해주세요.');
            return;
        }
        if (!formData.gender) {
            alert('성별을 골라주세요.');
            return;
        }
        if (!formData.address) {
            alert('주소를 입력해주세요.');
            return;
        }

        const response = await API.updateMemberBasicInfo(currentMemberId, formData);

        if (response.success) {
            alert('회원 정보가 성공적으로 수정되었습니다.');
            window.location.href = '/회원관리.html';
        } else {
            throw new Error(response.message || '회원 정보 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('회원 정보 수정 실패:', error);
        alert(error.message || '회원 정보 수정에 실패했습니다. 다시 시도해주세요.');
    }
}

async function handleModalDelete() {
    if (confirm('정말로 이 회원을 삭제하시겠습니까?')) {
        try {
            const programSelect = document.querySelector('.program-select');
            const selectedEnrollmentId = programSelect ? programSelect.value : null;

            if (!selectedEnrollmentId) {
                throw new Error('수업 정보를 찾을 수 없습니다.');
            }

            await API.deleteMember(selectedEnrollmentId);
            alert('회원이 성공적으로 삭제되었습니다.');
            closeModal();
            await loadMembers(showingHiddenMembers);
        } catch (error) {
            console.error('회원 삭제 실패:', error);
            alert(error.message || '회원 삭제에 실패했습니다.');
        }
    }
}

function closeModal() {
    document.querySelector('.modal-overlay').style.display = 'none';
    document.querySelector('.member-info-modal').style.display = 'none';
    currentMemberId = null;
}

async function toggleMemberVisibility(memberId, hidden) {
    try {
        await API.updateMemberVisibility(memberId, hidden);
        alert(hidden ? '회원이 숨김 처리되었습니다.' : '회원이 다시 표시됩니다.');
        closeModal();
        await loadMembers();
    } catch (error) {
        console.error('회원 숨김 처리 실패:', error);
        alert('회원 숨김 처리에 실패했습니다.');
    }
}

document.getElementById('modal-birthdate').addEventListener('change', function() {
    const birthdate = new Date(this.value);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    
    document.getElementById('modal-age').value = age;
});

function setupTooltip(element, text) {
    element.addEventListener('mouseover', (e) => {
        const existingTooltip = document.querySelector('.tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '14px';
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.style.zIndex = '1000';
        
        const rect = element.getBoundingClientRect();
        tooltip.style.top = (e.clientY - rect.top + 20) + 'px';
        tooltip.style.left = (e.clientX - rect.left + 10) + 'px';
        
        element.appendChild(tooltip);
    });

    element.addEventListener('mousemove', (e) => {
        const tooltip = element.querySelector('.tooltip');
        if (tooltip) {
            const rect = element.getBoundingClientRect();
            tooltip.style.top = (e.clientY - rect.top + 20) + 'px';
            tooltip.style.left = (e.clientX - rect.left + 10) + 'px';
        }
    });

    element.addEventListener('mouseout', () => {
        const tooltip = element.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    });
}
 
function formatSubscription(program) {
    if (!program) return '-';
    if (program.total_classes > 0) {
        return `${program.total_classes}회`;
    } else if (program.duration_months > 0) {
        return `${program.duration_months}개월`;
    }
    return '-';
 }

 function calculateAmount(program) {
    if (!program) return 0;
    if (program.original_amount !== undefined) {
        return program.original_amount;
    }
    if (program.total_classes > 0) {
        return program.per_class_price * program.total_classes;
    } else if (program.duration_months > 0) {
        return program.monthly_price * program.duration_months;
    }
    return 0;
}

function formatGender(gender) {
    if (!gender) return '-';
    return gender === 'male' ? '남성' : '여성';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatCurrency(amount) {
    if (!amount) return '-';
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
    }).format(amount);
}

function formatPaymentStatus(status) {
    if (!status) return '-';
    return status === 'paid' ? '완납' : '미납';
}

function setupEventListeners() {
    setupSearchFunction();
    setupSortButtons();
    setupMemberRegistrationButton();
    setupMemberEditButton();
    const toggleButton = document.getElementById('toggle-hidden-members');
    if (toggleButton) {
        toggleButton.addEventListener('click', async () => {
            showingHiddenMembers = !showingHiddenMembers;
            toggleButton.textContent = showingHiddenMembers ? '일반 회원 목록 보기' : '숨긴 회원 목록 보기';
            await loadMembers(showingHiddenMembers);
        });
    }
}

function setupSearchFunction() {
    const searchInput = document.querySelector('.search-bar input');
    const showAllButton = document.querySelector('.search-bar .show-all-button');
    const searchButton = document.querySelector('.search-bar .search-button');

    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            performSearch(searchInput.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }

    if (showAllButton) {
        showAllButton.addEventListener('click', async () => {
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.value = '';
        }
        await loadMembers();
        });
    }
}

function filterCards(searchTerm) {
    const cards = document.querySelectorAll('.card');
    searchTerm = searchTerm.toLowerCase().trim();

    cards.forEach(card => {
        const name = card.getAttribute('data-name');
        if (name.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function performSearch(searchTerm) {
    const rows = document.querySelectorAll('tbody tr');
    searchTerm = searchTerm.toLowerCase().trim();

    // 테이블 필터링
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });

    // 카드 필터링
    filterCards(searchTerm);
}

// 검색 이벤트 추가
const searchInput = document.querySelector('.search-bar input');
const searchButton = document.querySelector('.search-bar .search-button');
const showAllButton = document.querySelector('.search-bar .show-all-button');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            performSearch(searchInput.value);
        });
    }

    if (showAllButton) {
        showAllButton.addEventListener('click', async () => {
            searchInput.value = '';
            await loadMembers();
        });
    }
}

function setupSortButtons() {
    document.querySelectorAll('.button-group button').forEach(button => {
        button.addEventListener('click', async () => {
            const members = await API.getMembers();
            const type = button.textContent.trim();
            
            sortMembers(members, type);
            updateTable(members);
            updateCards(members);
        });
    });
}

function sortMembers(members, type) {
    switch(type) {
        case '이름순':
            members.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case '남은 횟수':
            members.sort((a, b) => {
                const aPrograms = a.programs || [];
                const bPrograms = b.programs || [];
                const aMinDays = aPrograms.length > 0 ? 
                    Math.min(...aPrograms.map(p => p.remaining_days || 0)) : 0;
                const bMinDays = bPrograms.length > 0 ? 
                    Math.min(...bPrograms.map(p => p.remaining_days || 0)) : 0;
                return aMinDays - bMinDays;
            });
            break;
        case '결제 상태':
            members.sort((a, b) => {
                const statusOrder = { 'paid': 1, 'unpaid': 0 };
                const aPrograms = a.programs || [];
                const bPrograms = b.programs || [];
                const aHasUnpaid = aPrograms.some(p => p.payment_status === 'unpaid');
                const bHasUnpaid = bPrograms.some(p => p.payment_status === 'unpaid');
                return (aHasUnpaid ? 0 : 1) - (bHasUnpaid ? 0 : 1);
            });
            break;
    }
}

function setupMemberRegistrationButton() {
    const registrationButton = document.querySelector('.member button:first-child');
    if (registrationButton) {
        registrationButton.addEventListener('click', () => {
            window.location.href = '회원정보등록.html';
        });
    }
}

function setupMemberEditButton() {
    const editButton = document.querySelector('.member button:last-child');
    if (editButton) {
        editButton.addEventListener('click', () => {
            window.location.href = '회원수업수정.html';
        });
    }
}

function showErrorMessage(message) {
    console.error(message);
    alert(message);
}

function toggleSidebar() { /*깃 수정사항 */ 
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

let currentPage = 1;
let totalPages = 1;
const PAGE_GROUP_SIZE = 5;
let itemsPerPage = window.innerWidth < 500 ? 7 : 10;  // 화면이 500px보다 작으면 7개, 그렇지 않으면 10개

// 화면 크기가 변경될 때마다 itemsPerPage를 갱신
window.addEventListener('resize', () => {
    itemsPerPage = window.innerWidth < 500 ? 7 : 10;
    updatePagination(totalItems);  // 페이지네이션 갱신
    loadMembers();  // 새로 고침하여 데이터 로드
});

function paginateMembers(members) {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return members.slice(start, end);
}

function getNextGroupPage() {
    // 현재 페이지가 속한 그룹의 첫 번째 페이지를 구합니다.
    const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
    console.log("현재 그룹:", currentGroup);
    const nextGroupFirstPage = (currentGroup) * PAGE_GROUP_SIZE + 1;
    

    // 총 페이지 수보다 큰 페이지로 가는 것을 방지합니다.
    return nextGroupFirstPage <= totalPages ? nextGroupFirstPage : totalPages;
}

function getPrevGroupPage() {
    // 현재 페이지가 속한 그룹의 첫 번째 페이지를 구합니다.
    const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
    const prevGroupFirstPage = (currentGroup - 2) * PAGE_GROUP_SIZE + 1;

    // 첫 번째 페이지보다 작은 페이지로 가는 것을 방지합니다.
    return prevGroupFirstPage > 0 ? prevGroupFirstPage : 1;
}

function updatePagination(totalItems) {
    totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
    const startPage = Math.max(1, (currentGroup - 1) * PAGE_GROUP_SIZE + 1);
    const endPage = Math.min(totalPages, startPage + PAGE_GROUP_SIZE - 1);

    let html = `
        <button id="prev-page" class="page-btn" ${currentPage === 1 ? 'disabled' : ''}>
            <svg class="arrow-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    `;

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    data-page="${i}">
                ${i}
            </button>
        `;
    }

    html += `
        <button id="next-page" class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}>
            <svg class="arrow-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    `;

    paginationContainer.innerHTML = html;
    setupPaginationEventListeners();
    console.log("현재 그룹:", currentGroup);
}

let isLoading = false;  // 로딩 중 여부를 확인하는 변수

function setupPaginationEventListeners() {
    const paginationContainer = document.querySelector('.pagination');
    
    paginationContainer.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button || isLoading) return;  // 로딩 중이라면 이벤트를 무시

        isLoading = true;  // 로딩 시작
        
        if (button.id === 'prev-page' && currentPage > 1) {
            currentPage = getPrevGroupPage();
            await loadMembers();
        } else if (button.id === 'next-page' && currentPage < totalPages) {
            currentPage = getNextGroupPage();
            await loadMembers();
        } else if (button.dataset.page) {
            currentPage = parseInt(button.dataset.page);
            await loadMembers();
        }

        isLoading = false;  // 로딩 끝
    });
}

