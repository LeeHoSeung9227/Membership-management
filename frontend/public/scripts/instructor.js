document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadInstructors();
    } catch (error) {
        console.error('선생님 데이터 로드 실패:', error);
        API.handleApiError(error);
    }
});

async function loadInstructors() {
    try {
        instructors = await API.getInstructors();
        totalPages = Math.ceil(instructors.length / itemsPerPage);
        updatePagination();
        updateTable(paginateMembers());
    } catch (error) {
        throw error;
    }
}

function updateTable(instructors) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';
    
    instructors.forEach(instructor => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${instructor.name || '-'}</td>
            <td>${instructor.phone || '-'}</td>
            <td>${formatCurrency(instructor.salary) || '-'}</td>
            <td>
                <a href="선생님정보수정.html?id=${instructor.id}"><button class="btn-primary">수정</button></a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function formatCurrency(amount) {
    if (!amount) return '-';
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
    }).format(amount);
}

function setupEventListeners() {
    const searchInput = document.querySelector('.search-bar input');
    const showAllButton = document.querySelector('.search-bar button');
    const searchButton = document.querySelector('.search-bar button');
    
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
            await loadInstructors();
        });
    }
}

function performSearch(searchTerm) {
    const rows = document.querySelectorAll('tbody tr');
    searchTerm = searchTerm.toLowerCase().trim();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadInstructors();
        setupEventListeners();
    } catch (error) {
        console.error('선생님 데이터 로드 실패:', error);
        API.handleApiError(error);
    }
});

function toggleSidebar() { 
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}
/*페이지네이션*/
let currentPage = 1; 
let totalPages = 1; 
const PAGE_GROUP_SIZE = 5; 
let itemsPerPage = window.innerWidth < 500 ? 7 : 10; 

// 화면 크기 변경 시 아이템 수 업데이트
window.addEventListener('resize', () => {
    itemsPerPage = window.innerWidth < 500 ? 7 : 10;
    updatePagination();
    updateTable(paginateMembers());
});

function paginateMembers() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return instructors.slice(start, end);
}

function updatePagination() {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

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
            await loadInstructors();
            console.log("현재 페이지:", currentPage);
        } else if (button.id === 'next-page' && currentPage < totalPages) {
            currentPage = getNextGroupPage();
            await loadInstructors();
            console.log("현재 페이지:", currentPage);
        } else if (button.dataset.page) {
            currentPage = parseInt(button.dataset.page);
            await loadInstructors();
            console.log("현재 페이지:", currentPage);
        }
        isLoading = false;  // 로딩 끝
    });
}

function getNextGroupPage() {
    // 현재 페이지가 속한 그룹의 첫 번째 페이지를 구합니다.
    const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
    console.log("현재 그룹:", currentGroup);
    const nextGroupFirstPage = (currentGroup) * PAGE_GROUP_SIZE +1;
    

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
