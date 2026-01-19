// 전역 변수로 현재 선택된 프로그램 ID 관리
let selectedProgramId = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 연도 선택 옵션 설정
        const yearSelect = document.getElementById('year');
        if (!yearSelect) {
            throw new Error('연도 선택 요소를 찾을 수 없습니다.');
        }

        const currentYear = new Date().getFullYear();
        const startYear = 2024;
        const endYear = 2028;
        
        yearSelect.innerHTML = '';
        
        for (let year = startYear; year <= endYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = `${year}년`;
            yearSelect.appendChild(option);
            
            if (year === currentYear) {
                option.selected = true;
            }
        }

        await loadPrograms();
        setupEventListeners();
        
    } catch (error) {
        console.error('초기화 실패:', error);
        alert('데이터 로드에 실패했습니다: ' + error.message);
    }
});

async function loadPrograms() {
    try {
        const programs = await API.getPrograms();
        const programDropdown = document.getElementById('program-dropdown');
        
        if (!programDropdown) {
            console.error('프로그램 드롭다운 메뉴를 찾을 수 없습니다.');
            return;
        }
        
        programDropdown.innerHTML = '<option value="">프로그램 선택</option>';
        
        if (programs && programs.length > 0) {
            programs.forEach(program => {
                const option = document.createElement('option');
                option.value = program.id;
                option.textContent = program.name;
                programDropdown.appendChild(option);
            });

            selectedProgramId = programs[0].id;
            programDropdown.value = selectedProgramId;
            
            await loadAttendanceData();
        } else {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "등록된 프로그램이 없습니다";
            programDropdown.appendChild(option);
        }
    } catch (error) {
        console.error('프로그램 목록 로드 실패:', error);
        throw error;
    }
}

// 드롭다운에서 프로그램 선택 이벤트 처리
document.getElementById('program-dropdown').addEventListener('change', async (e) => {
    selectedProgramId = e.target.value; // 선택된 프로그램 ID 업데이트
    await loadAttendanceData(); // 선택된 프로그램에 맞는 데이터 로드
});

async function toggleSidebar() { /*깃 수정사항 */ 
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

/*
async function selectProgram(program) {
    selectedProgramId = program.id;
    
    // UI 업데이트
    document.querySelectorAll('.program-item').forEach(item => {
        item.classList.remove('selected');
    });
    const selectedItem = document.querySelector(`[data-program-id="${program.id}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }
    
    // 선택된 프로그램의 출석 데이터 로드
    await loadAttendanceData();
}
*/

/* 메뉴를 누르면 사이드바가 나타나게 하고 싶을떄
async function toggleSidebar() { 
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.toggle('active');
    }
*/


async function loadAttendanceData() {
    try {
        const month = document.getElementById('month').value;
        const year = document.getElementById('year').value;
     
        const attendanceData = await API.getAttendanceList({
            program_id: selectedProgramId,
            month: parseInt(month) + 1,
            year: year,
            includeHidden: false
        });

        console.log('출석 데이터:', attendanceData);  // 데이터 확인용 로그

        if (!attendanceData || attendanceData.length === 0) {
            alert('출석 데이터가 없습니다.');
            return;
        }

        // 데이터 길이를 기준으로 페이지네이션 업데이트
        updatePagination(attendanceData.length);

        updateAttendanceTable(attendanceData);
    } catch (error) {
        console.error('출석 데이터 로드 실패:', error);
        alert('출석 데이터를 불러오는데 실패했습니다.');
    }
}


function updateAttendanceTable(data) {
    const tableBody = document.querySelector('.attendance-table tbody');
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const daysInMonth = new Date(year, parseInt(month) + 1, 0).getDate();

    updateTableHeader(daysInMonth);

    const paginatedData = paginateAttendance(data);  // 페이지당 데이터 잘라서 표시

    const memberAttendance = groupAttendanceByMember(paginatedData);  // 그룹화된 데이터를 사용
    
    tableBody.innerHTML = '';  // 테이블 내용 초기화

    // 회원별 출석 데이터를 테이블에 추가
    Object.entries(memberAttendance).forEach(([memberName, attendance]) => {
        const tr = document.createElement('tr');
        const checkboxes = []; // 회원별 체크박스 배열 추가
        
        const tdName = document.createElement('td');
        tdName.textContent = memberName;
        tr.appendChild(tdName);

        // 날짜별 체크박스 생성
        for (let day = 1; day <= daysInMonth; day++) {
            const td = document.createElement('td');
            const currentDate = new Date(year, month, day);
            const formattedDate = formatDate(currentDate);
            
            if (currentDate.getDay() === 0) {
                td.classList.add('sunday');
                tr.appendChild(td);
                continue;
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            
            const isAttended = attendance.dates.some(date => 
                formatDate(new Date(date)) === formattedDate
            );
            checkbox.checked = isAttended;

            // 남은 횟수가 0이고 체크되지 않은 경우 비활성화
            if (attendance.remaining_days <= 0 && !isAttended) {
                checkbox.disabled = true;
                checkbox.title = '남은 수업 일수가 없습니다';
            }

            checkboxes.push(checkbox); // 체크박스 배열에 추가

            checkbox.addEventListener('change', async (e) => {
                try {
                    if (!attendance.enrollment_id) {
                        throw new Error('수강 정보를 찾을 수 없습니다.');
                    }

                    const attendanceData = {
                        enrollment_id: attendance.enrollment_id,
                        attendance_date: formattedDate,
                        is_present: checkbox.checked
                    };

                    const response = await API.checkAttendance(attendanceData);
                    
                    // 출석 상태에 따라 남은 일수 업데이트
                    if (checkbox.checked) {
                        attendance.dates.push(formattedDate);
                        attendance.remaining_days--;
                    } else {
                        attendance.dates = attendance.dates.filter(date => 
                            formatDate(new Date(date)) !== formattedDate
                        );
                        attendance.remaining_days++;
                    }

                    // 출석 횟수와 남은 일수 업데이트
                    const countCell = tr.querySelector('td:nth-last-child(2)');
                    const remainingCell = tr.querySelector('td:nth-last-child(1)');
                    
                    countCell.textContent = attendance.dates.length;
                    remainingCell.textContent = attendance.remaining_days;

                    // 남은 일수가 0이 되면 모든 미체크 체크박스 비활성화
                    checkboxes.forEach(cb => {
                        if (attendance.remaining_days <= 0) {
                            cb.disabled = !cb.checked;
                            cb.title = cb.disabled ? '남은 수업 일수가 없습니다' : '';
                            remainingCell.style.color = 'red';
                        } else {
                            cb.disabled = false;
                            cb.title = '';
                            remainingCell.style.color = attendance.remaining_days <= 3 ? '#E56736' : '';
                        }
                    });

                } catch (error) {
                    console.error('출석 체크 실패:', error);
                    checkbox.checked = !checkbox.checked;
                    alert(error.message || '출석 처리 중 오류가 발생했습니다.');
                }
            });

            td.appendChild(checkbox);
            tr.appendChild(td);
        }

        // 출석 횟수와 남은 일수 표시
        const tdCount = document.createElement('td');
        tdCount.textContent = attendance.dates.length;
        tr.appendChild(tdCount);
        
        const tdRemaining = document.createElement('td');
        const remainingDays = Math.max(0, attendance.remaining_days);
        tdRemaining.textContent = remainingDays;
        if (remainingDays === 0) {
            tdRemaining.style.color = 'red';
        } else if (remainingDays <= 3) {
            tdRemaining.style.color = '#E56736';
        }
        tr.appendChild(tdRemaining);

        tableBody.appendChild(tr);
    });

    updatePagination(data.length);  // 페이지네이션 업데이트
}

function groupAttendanceByMember(data) {
    return data.reduce((acc, curr) => {
        if (!acc[curr.member_name]) {
            acc[curr.member_name] = {
                enrollment_id: curr.enrollment_id,
                remaining_days: curr.remaining_days,
                dates: curr.attendance_dates || []
            };
        }
        return acc;
    }, {});
}
function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function setupEventListeners() {
    document.getElementById('year').addEventListener('change', loadAttendanceData);
    document.getElementById('month').addEventListener('change', loadAttendanceData);
}
function updateTableHeader(daysInMonth) {
    const thead = document.querySelector('.attendance-table thead');
    thead.innerHTML = '';

    // 날짜 행
    const dateRow = document.createElement('tr');

    // 요일 행
    const dayRow = document.createElement('tr');

    // 첫 번째 열: "회원 이름"
    const nameHeader = document.createElement('th');
    nameHeader.rowSpan = 2; // 두 행을 병합
    nameHeader.textContent = screenWidth < 500 ? '회원' : '회원 이름';  
    dateRow.appendChild(nameHeader);

    // 날짜와 요일 열 추가
    for (let i = 1; i <= daysInMonth; i++) {
        const year = document.getElementById('year').value;
        const month = document.getElementById('month').value;

        // 현재 날짜 객체 생성
        const currentDate = new Date(year, parseInt(month), i);
        const weekday = currentDate.getDay(); // 요일 (0: 일요일, 6: 토요일)

        // 날짜 열
        const dateTh = document.createElement('th');
        dateTh.textContent = `${i}일`;
        dateTh.className = weekday === 0 ? 'sunday' : weekday === 6 ? 'saturday' : ''; // 일요일 빨간색, 토요일 파란색
        dateRow.appendChild(dateTh);

        // 요일 열
        const dayTh = document.createElement('th');
        dayTh.textContent = ['일', '월', '화', '수', '목', '금', '토'][weekday]; // 요일 배열로 변환
        dayTh.className = weekday === 0 ? 'sunday' : weekday === 6 ? 'saturday' : ''; // 일요일 빨간색, 토요일 파란색
        dayRow.appendChild(dayTh);
    }

    // 마지막 열: "출석 횟수"와 "남은 일수"
    const attendanceHeader = document.createElement('th');
    attendanceHeader.rowSpan = 2;
    attendanceHeader.textContent = screenWidth < 500 ? '출석' : '출석 횟수';
    dateRow.appendChild(attendanceHeader);

    const remainingHeader = document.createElement('th');
    remainingHeader.rowSpan = 2;
    remainingHeader.textContent = screenWidth < 500 ? '잔여' : '남은 횟수';
    dateRow.appendChild(remainingHeader);

    // 테이블 헤더에 행 추가
    thead.appendChild(dateRow);
    thead.appendChild(dayRow);
}



let currentPage = 1;
let totalPages = 1;
const PAGE_GROUP_SIZE = 5;
const table = document.querySelector('.attendance-container'); // 테이블 요소
const screenWidth = table.offsetWidth;  // 테이블의 실제 보이는 너비
let itemsPerPage = screenWidth < 500 ? 7 : 10;  // 화면이 500px보다 작으면 7개, 그렇지 않으면 10개

// 화면 크기가 변경될 때마다 itemsPerPage를 갱신
window.addEventListener('resize', () => {
    itemsPerPage = window.innerWidth < 500 ? 7 : 10;
    updatePagination(totalItems);  // 페이지네이션 갱신
    loadMembers();  // 새로 고침하여 데이터 로드
})

// 출석부 페이지네이션 관련 함수
function paginateAttendance(attendanceData) {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return attendanceData.slice(start, end);
}

function updatePagination(totalItems) {
    totalPages = Math.ceil(totalItems / itemsPerPage);  // 페이지 개수 계산
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
            await loadAttendanceData();
        } else if (button.id === 'next-page' && currentPage < totalPages) {
            currentPage = getNextGroupPage();
            await loadAttendanceData();
        } else if (button.dataset.page) {
            currentPage = parseInt(button.dataset.page);
            await loadAttendanceData();
        }
        isLoading = false;  // 로딩 끝
    });
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
