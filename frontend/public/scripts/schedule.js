const TITLE_STORAGE_KEY = "scheduleTitle";
const DEFAULT_TITLE = "수업 시간표"; 
// 로컬 스토리지에서 데이터 불러오기
window.onload = () => {
    drawTimeLines();  // 페이지 로드 시 처음 한번 선을 그리기
    const savedData = localStorage.getItem('classData');
    const savedTitle = localStorage.getItem(TITLE_STORAGE_KEY);
    if (savedData) {
        const savedTitle = localStorage.getItem(TITLE_STORAGE_KEY) || DEFAULT_TITLE; // 저장된 값이 없으면 초기값 사용
        title.textContent = savedTitle; // 저장된 제목으로 설정
        titleInput.value = savedTitle; // 입력창에도 저장된 제목 표시
        classData = JSON.parse(savedData);
        renderClasses();
    }
    };


const title = document.getElementById('title');
const titleInput = document.getElementById('title-input');


// 제목 클릭 시 입력창으로 전환
title.addEventListener('click', () => {
    title.style.display = 'none';
    titleInput.style.display = 'block';
    titleInput.focus();
});

// 입력창에서 엔터키를 누르면 제목으로 저장
titleInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        saveTitle();
    }
});
//포커스 아웃도 제목 저장
titleInput.addEventListener('blur', () => {
    title.textContent = titleInput.value;
    titleInput.style.display = 'none';
    title.style.display = 'block';
    saveTitle();
});
// 저장 함수
const saveTitle = () => {
    const newTitle = titleInput.value.trim();
    if (newTitle) {
        title.textContent = newTitle;
        localStorage.setItem(TITLE_STORAGE_KEY, newTitle); // 로컬 스토리지에 저장
    }
    titleInput.style.display = "none"; // 입력창 숨기기
    title.style.display = "block"; // 제목 표시
}

let timeSelectionCount = 1;
let isEditing = false;
let deleteMode = false;
let currentProgramId = null;
let selectedColor = '#E56736';

function editClickHandler(e) {
    if (!deleteMode) {
        const id = e.currentTarget.getAttribute('data-id');
        isEditing = true;
        currentProgramId = parseInt(id);
        openEditModal(parseInt(id));
    }
}

function deleteClickHandler(e) {
    e.stopPropagation();
    const timeElement = e.currentTarget.querySelector(".time");
    const [startTime, endTime] = timeElement.textContent.split("~").map(t => t.trim());
    const dayElement = e.currentTarget.closest(".day");
    const day = dayElement.querySelector("h2").textContent;
    deleteClass(day, startTime, endTime);
}

function openTimeModal() {
    document.getElementById('time-modal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function closeTimeModal() {
    document.getElementById('time-modal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

function generateHourOptions() {
    let periods = ['오전', '오후'];
    let options = '';
    periods.forEach(period => {
        options += `<option value="${period}">${period}</option>`;
    });
    return options;
}

function generateTimeOptions() {
    let hourOptions = '';
    let minuteOptions = '';

    for (let hour = 1; hour <= 12; hour++) {
        hourOptions += `<option value="${hour}">${hour}시</option>`;
    }

    for (let minute = 0; minute < 60; minute += 10) {
        const formattedMinute = minute.toString().padStart(2, '0');
        minuteOptions += `<option value="${formattedMinute}">${formattedMinute}분</option>`;
    }

    return { hourOptions, minuteOptions };
}

function addTimeSelection() {
    const container = document.getElementById('time-selection-container');
    const newSelection = document.createElement('div');
    newSelection.classList.add('time-selection');
    newSelection.id = `time-selection-${timeSelectionCount}`;

    const { hourOptions, minuteOptions } = generateTimeOptions();

    newSelection.innerHTML = `
        <label for="day-${timeSelectionCount}">요일</label>
        <select id="day-${timeSelectionCount}" onchange="updateDayText(this)">
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
        </select>

        <label for="start-time-period-${timeSelectionCount}">시작 시간</label>
        <select id="start-time-period-${timeSelectionCount}" class="time-period">
            ${generateHourOptions()}
        </select>
        <select id="start-time-hour-${timeSelectionCount}" class="time-hour">
            ${hourOptions}
        </select>
        <select id="start-time-minute-${timeSelectionCount}" class="time-minute">
            ${minuteOptions}
        </select>

        <label for="end-time-period-${timeSelectionCount}">종료 시간</label>
        <select id="end-time-period-${timeSelectionCount}" class="time-period">
            ${generateHourOptions()}
        </select>
        <select id="end-time-hour-${timeSelectionCount}" class="time-hour">
            ${hourOptions}
        </select>
        <select id="end-time-minute-${timeSelectionCount}" class="time-minute">
            ${minuteOptions}
        </select>
        <button class="remove-btn" onclick="removeTimeSelection(${timeSelectionCount})">一</button>
        <div class="divider"></div>
    `;
    container.appendChild(newSelection);
    timeSelectionCount++;
}

function setupInitialTimeSelection() {
    const timeSelectionContainer = document.getElementById('time-selection-container');
    const { hourOptions, minuteOptions } = generateTimeOptions();

    timeSelectionContainer.innerHTML = `
        <div class="time-selection" id="time-selection-0">
            <label for="day-0">요일</label>
            <select id="day-0">
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
            </select>

            <label for="start-time-period-0">시작 시간</label>
            <select id="start-time-period-0" class="time-period">
                ${generateHourOptions()}
            </select>
            <select id="start-time-hour-0" class="time-hour">
                ${hourOptions}
            </select>
            <select id="start-time-minute-0" class="time-minute">
                ${minuteOptions}
            </select>

            <label for="end-time-period-0">종료 시간</label>
            <select id="end-time-period-0" class="time-period">
                ${generateHourOptions()}
            </select>
            <select id="end-time-hour-0" class="time-hour">
                ${hourOptions}
            </select>
            <select id="end-time-minute-0" class="time-minute">
                ${minuteOptions}
            </select>
            <button class="remove-btn" onclick="removeTimeSelection(0)">一</button>
            <div class="divider"></div>
        </div>
    `;
}
// 화면 크기가 1000px 미만일 때 요일을 짧게 표시하는 함수
function updateDayText(selectElement) {
    if (window.innerWidth <= 1000) {
        const dayText = selectElement.value;
        let shortDay = dayText;

        switch (dayText) {
            case 'Monday': shortDay = 'Mon'; break;
            case 'Tuesday': shortDay = 'Tue'; break;
            case 'Wednesday': shortDay = 'Wed'; break;
            case 'Thursday': shortDay = 'Thu'; break;
            case 'Friday': shortDay = 'Fri'; break;
            case 'Saturday': shortDay = 'Sat'; break;
        }

        // '요일'을 shortDay로 변경
        selectElement.options[selectElement.selectedIndex].text = shortDay;
        selectElement.value = shortDay;  // 실제 value도 변경
    }
}

// 축약형 요일을 전체 요일 이름으로 변환하는 함수
function getFullDayName(shortDay) {
    switch(shortDay) {
        case 'Mon': return 'Monday';
        case 'Tue': return 'Tuesday';
        case 'Wed': return 'Wednesday';
        case 'Thu': return 'Thursday';
        case 'Fri': return 'Friday';
        case 'Sat': return 'Saturday';
        case 'Sun': return 'Sunday';
        default: return shortDay; // 잘못된 경우는 그대로 반환
    }
}


function removeTimeSelection(id) {
    const element = document.getElementById(`time-selection-${id}`);
    if (element) {
        element.remove();
    }
}

async function confirmSelection() {
    const selections = document.querySelectorAll('.time-selection');
    let hasConflict = false;
    let conflictMessages = [];
    
    try {
        for (const selection of selections) {
            const day = selection.querySelector('select').value;
            
            const startPeriod = selection.querySelector('[id^="start-time-period"]').value;
            const startHour = selection.querySelector('[id^="start-time-hour"]').value;
            const startMinute = selection.querySelector('[id^="start-time-minute"]').value;
            
            const endPeriod = selection.querySelector('[id^="end-time-period"]').value;
            const endHour = selection.querySelector('[id^="end-time-hour"]').value;
            const endMinute = selection.querySelector('[id^="end-time-minute"]').value;

            const startHour24 = startPeriod === '오후' && startHour !== '12' ? 
                parseInt(startHour) + 12 : 
                startPeriod === '오전' && startHour === '12' ? 0 : parseInt(startHour);
            
            const endHour24 = endPeriod === '오후' && endHour !== '12' ? 
                parseInt(endHour) + 12 : 
                endPeriod === '오전' && endHour === '12' ? 0 : parseInt(endHour);

            const startTime = `${startHour24.toString().padStart(2, '0')}:${startMinute}`;
            const endTime = `${endHour24.toString().padStart(2, '0')}:${endMinute}`;

            const programIdToExclude = isEditing ? currentProgramId : null;
            
            const conflict = await checkTimeConflict(day, startTime, endTime, programIdToExclude);
            if (conflict) {
                hasConflict = true;
                conflictMessages.push(`${day} ${startTime}~${endTime}`);
            }
        }

        if (hasConflict) {
            alert(`다음 시간대에 이미 수업이 존재합니다:\n${conflictMessages.join('\n')}`);
            return;
        }

        alert('시간이 선택되었습니다.');
        closeTimeModal();
    } catch (error) {
        console.error('시간 선택 중 오류:', error);
        alert(error.message || '시간 선택 중 오류가 발생했습니다.');
    }
}

function createClassElement(data) {
    const { startTime, endTime, className, details, instructor, color } = data;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // 화면 크기가 1000px 이하일 때 계산 방식 변경
    let startPositionMinutes, durationMinutes;

    if (window.innerWidth <= 1000) {
        // 화면 크기가 1000px 이하일 경우
        startPositionMinutes = (startHour - 10) * 100 + (startMinute * 100 / 60) + 42;
        durationMinutes = (endHour - startHour) * 98 + ((endMinute - startMinute) * 98 / 60);
    } else {
        // 화면 크기가 1000px 이상일 경우
        startPositionMinutes = (startHour - 10) * 110 + (startMinute * 108 / 60) + 80;
        durationMinutes = (endHour - startHour) * 108 + ((endMinute - startMinute) * 108 / 60);
    }

    const formattedStartTime = `${startTime.split(':')[0]}:${startTime.split(':')[1]}`;
    const formattedEndTime = `${endTime.split(':')[0]}:${endTime.split(':')[1]}`;

    const classElement = document.createElement('div');
    classElement.classList.add('class');

    classElement.style.top = `${startPositionMinutes}px`;
    classElement.style.height = `${durationMinutes}px`;

    classElement.addEventListener('click', editClickHandler);
    
    classElement.setAttribute('data-id', data.id);

    classElement.innerHTML = `
        <div class="time">
            ${formattedStartTime} ~ ${formattedEndTime}
        </div>
        <div class="content" style="background-color: ${color};">
            <div class="name" style="white-space: pre-wrap;">${className}</div>
            <div class="details">${details || '-'}</div>
        </div>
        <div class="instructor">
            T. ${instructor || '-'}
        </div>
    `;

    return classElement;
}

function openModal() {
    isEditing = false;
    currentProgramId = null;
    resetForm();
    document.getElementById('modal-title').textContent = '수업 추가';
    document.getElementById('submit-btn').textContent = '추가';
    document.getElementById('class-modal').classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

async function openEditModal(programId) {
    try {
        isEditing = true;
        currentProgramId = programId;
        const program = await API.getProgram(programId);
        document.getElementById('modal-title').textContent = '수업 수정';
        document.getElementById('submit-btn').textContent = '수정';

        // 수업 기본 정보 설정
        document.getElementById('class-name').value = program.name;
        document.getElementById('monthly-price').value = program.monthly_price;
        document.getElementById('per-class-price').value = program.per_class_price;
        document.getElementById('instructor-name').value = program.instructor_name || '';

        // 시간 데이터 채우기
        const timeSelectionContainer = document.getElementById('time-selection-container');
        timeSelectionContainer.innerHTML = ''; // 기존 시간 선택 UI 초기화
        timeSelectionCount = 0; // 새로운 시간 선택 초기화

        if (program.classes && program.classes.length > 0) {
            program.classes.forEach((classInfo) => {
                addTimeSelection(); // 새로운 시간 선택 UI 추가
                const currentIndex = timeSelectionCount - 1;

                // 요일 설정
                const daySelect = document.getElementById(`day-${currentIndex}`);
                if (daySelect) {
                    daySelect.value = classInfo.day;
                }

                // 시작 시간 설정
                if (classInfo.startTime) {
                    const [startHour, startMinute] = classInfo.startTime.split(':');
                    const startHour24 = parseInt(startHour);
                    const startPeriod = startHour24 >= 12 ? '오후' : '오전';
                    const startHour12 = startHour24 > 12 ? startHour24 - 12 : (startHour24 === 0 ? 12 : startHour24);

                    document.getElementById(`start-time-period-${currentIndex}`).value = startPeriod;
                    document.getElementById(`start-time-hour-${currentIndex}`).value = startHour12;
                    document.getElementById(`start-time-minute-${currentIndex}`).value = startMinute;
                }

                // 종료 시간 설정
                if (classInfo.endTime) {
                    const [endHour, endMinute] = classInfo.endTime.split(':');
                    const endHour24 = parseInt(endHour);
                    const endPeriod = endHour24 >= 12 ? '오후' : '오전';
                    const endHour12 = endHour24 > 12 ? endHour24 - 12 : (endHour24 === 0 ? 12 : endHour24);

                    document.getElementById(`end-time-period-${currentIndex}`).value = endPeriod;
                    document.getElementById(`end-time-hour-${currentIndex}`).value = endHour12;
                    document.getElementById(`end-time-minute-${currentIndex}`).value = endMinute;
                }
            });
        } else {
            addTimeSelection();
        }

        // 주간 수업 횟수 설정
        document.getElementById('classes-per-week').value = program.classes.length || 1;

        // 특이사항 설정
        document.getElementById('class-details').value = program.classes[0]?.details || '';

        // 색상 설정
        selectedColor = program.classes[0]?.color || '#E56736';
        const colorPreview = document.getElementById('color-preview');
        colorPreview.style.backgroundColor = selectedColor;

        // 모달 열기
        document.getElementById('class-modal').classList.add('active');
        document.getElementById('modal-overlay').classList.add('active');
    } catch (error) {
        console.error('수업 데이터 로드 실패:', error);
        alert('수업 정보를 불러오는데 실패했습니다.');
    }
}

function closeModal() {
    document.getElementById('class-modal').classList.remove('active');
    document.getElementById('modal-overlay').classList.remove('active');
}

async function handleSubmit() {
    if (isEditing) {
        await updateProgram();
    } else {
        await addClass();
    }
}

function getTimeSelections() {
    const timeSelections = document.querySelectorAll('.time-selection');
    const details = document.getElementById('class-details').value.trim();

    const schedules = Array.from(timeSelections).map(selection => {
        const daySelect = selection.querySelector('select[id^="day"]');
        const startPeriod = selection.querySelector('[id^="start-time-period"]').value;
        const startHour = selection.querySelector('[id^="start-time-hour"]').value;
        const startMinute = selection.querySelector('[id^="start-time-minute"]').value;
        const endPeriod = selection.querySelector('[id^="end-time-period"]').value;
        const endHour = selection.querySelector('[id^="end-time-hour"]').value;
        const endMinute = selection.querySelector('[id^="end-time-minute"]').value;

        if (!daySelect || !startPeriod || !startHour || !startMinute || !endPeriod || !endHour || !endMinute) {
            return null;
        }

        const startHour24 = startPeriod === '오후' && startHour !== '12' ? 
            parseInt(startHour) + 12 : 
            startPeriod === '오전' && startHour === '12' ? 0 : parseInt(startHour);
        
        const endHour24 = endPeriod === '오후' && endHour !== '12' ? 
            parseInt(endHour) + 12 : 
            endPeriod === '오전' && endHour === '12' ? 0 : parseInt(endHour);

        return {
            day: daySelect.value,
            startTime: `${startHour24.toString().padStart(2, '0')}:${startMinute}`,
            endTime: `${endHour24.toString().padStart(2, '0')}:${endMinute}`,
            details: details,
            color: selectedColor
        };
    });

    return schedules.filter(schedule => schedule !== null);
}

async function updateProgram() {
    try {
        // 필수 입력값 검증
        const name = document.getElementById('class-name').value.trim();
        const monthlyPrice = parseInt(document.getElementById('monthly-price').value);
        const perClassPrice = parseInt(document.getElementById('per-class-price').value);
        const instructorName = document.getElementById('instructor-name').value.trim();
        const classesPerWeek = parseInt(document.getElementById('classes-per-week').value);
        const timeSelections = getTimeSelections();

        // 필수 입력값 확인
        if (!name) {
            alert('수업 이름을 입력해주세요.');
            return;
        }

        if (!monthlyPrice || monthlyPrice <= 0) {
            alert('유효한 개월 수강료를 입력해주세요.');
            return;
        }

        if (!perClassPrice || perClassPrice <= 0) {
            alert('유효한 회당 수강료를 입력해주세요.');
            return;
        }

        if (!timeSelections || timeSelections.length === 0) {
            alert('수업 시간을 선택해주세요.');
            return;
        }

        if (timeSelections.length !== classesPerWeek) {
            alert(`주당 ${classesPerWeek}회로 설정하셨습니다. ${classesPerWeek}개의 시간을 선택해주세요. (현재 ${timeSelections.length}개 선택됨)`);
            return;
        }

        if (instructorName) {
            const instructors = await API.getInstructors();
            const instructorExists = instructors.some(
                instructor => instructor.name === instructorName
            );

            if (!instructorExists) {
                alert('등록되지 않은 선생님입니다. 먼저 선생님을 등록해주세요.');
                return;
            }
        }

        const programData = {
            name: name,
            instructor_name: document.getElementById('instructor-name').value.trim(),
            monthly_price: monthlyPrice,
            per_class_price: perClassPrice,
            schedules: timeSelections,
            color: selectedColor
        };

        await API.updateProgram(currentProgramId, programData);
        alert('수업이 성공적으로 수정되었습니다.');
        closeModal();
        await loadPrograms();
    } catch (error) {
        console.error('수업 수정 실패:', error);
        alert(error.message || '수업 수정에 실패했습니다.');
    }
}

function validateClassData(data) {
    return Object.values(data).every(value => value.trim() !== '');
}

// 삭제 모드 토글 함수
function toggleDeleteMode() {
    deleteMode = !deleteMode;
    const deleteBtn = document.getElementById("delete-class-btn");
    
    if (deleteMode) {
        alert("삭제할 수업을 클릭하세요.");
        deleteBtn.style.backgroundColor = "#FF0000";
        enableDeleteMode();
    } else {
        deleteBtn.style.backgroundColor = "#E56736";
        disableDeleteMode();
    }
}

let classData = [];
// 수업 삭제 함수
async function deleteClass(day, startTime, endTime) {
    try {
        console.log('삭제 시도:', { day, startTime, endTime });
        
        const dayElements = document.querySelectorAll('.day');
        let targetProgram = null;

        // DOM에서 해당 클래스 찾기
        for(let dayElement of dayElements) {
            const dayHeader = dayElement.querySelector('h2');
            if (dayHeader && dayHeader.textContent === day) {
                const classes = dayElement.querySelectorAll('.class');
                for(let cls of classes) {
                    const timeElement = cls.querySelector('.time');
                    const nameElement = cls.querySelector('.content .name');
                    const timeText = timeElement.textContent.trim();
                    const [currentStartTime, currentEndTime] = timeText.split('~').map(t => t.trim());
                    
                    console.log('비교 중:', {
                        currentStartTime,
                        currentEndTime,
                        targetStartTime: startTime,
                        targetEndTime: endTime
                    });
                    
                    if (currentStartTime === startTime && currentEndTime === endTime) {
                        targetProgram = {
                            name: nameElement.textContent.trim(),
                            element: cls
                        };
                        break;
                    }
                }
            }
        }

        console.log('찾은 수업:', targetProgram);

        if (!targetProgram) {
            throw new Error('삭제할 클래스를 화면에서 찾을 수 없습니다.');
        }

        // 수업 목록 가져오기
        const programs = await API.getPrograms();
        console.log('전체 수업 목록:', programs);

        // 시간 형식을 비교하기 위한 도우미 함수
        const normalizeTime = (time) => {
            // HH:MM 또는 HH:MM:SS 형식을 HH:MM으로 통일
            return time.split(':').slice(0, 2).join(':');
        };

        // 일치하는 수업 찾기
        const program = programs.find(p => {
            const matchingClass = p.classes.find(c => {
                const timeMatch = 
                    normalizeTime(c.startTime) === normalizeTime(startTime) && 
                    normalizeTime(c.endTime) === normalizeTime(endTime);
                const dayMatch = c.day === day;
                const nameMatch = p.name === targetProgram.name;
                
                console.log('수업 비교:', {
                    programName: p.name,
                    className: targetProgram.name,
                    timeMatch,
                    dayMatch,
                    nameMatch,
                    classInfo: c,
                    normalizedTimes: {
                        apiStart: normalizeTime(c.startTime),
                        apiEnd: normalizeTime(c.endTime),
                        targetStart: normalizeTime(startTime),
                        targetEnd: normalizeTime(endTime)
                    }
                });
                
                return timeMatch && dayMatch;
            });
            
            return matchingClass !== undefined;
        });

        console.log('찾은 수업 데이터:', program);

        if (!program) {
            throw new Error('삭제할 수업을 API에서 찾을 수 없습니다.');
        }

        // 삭제 전 확인
        if (!confirm(`정말로 "${targetProgram.name}" 수업을 삭제하시겠습니까?`)) {
            return;
        }

        // 수업 삭제
        await API.deleteProgram(program.id);
        
        // DOM에서 클래스 요소 삭제
        targetProgram.element.remove();
        
        alert('수업이 성공적으로 삭제되었습니다.');
        
        // 수업 목록 새로고침
        const updatedPrograms = await API.getPrograms();
        document.querySelectorAll('.day .classes').forEach(container => {
            container.innerHTML = '';
        });

        updatedPrograms.forEach(program => {
            program.classes?.forEach(classInfo => {
                const dayElements = document.querySelectorAll('.day');
                dayElements.forEach(dayElement => {
                    const day = dayElement.querySelector('h2').innerText;
                    const classesContainer = dayElement.querySelector('.classes');

                    if (classInfo.day === day) {
                        const classElement = createClassElement({
                            id: program.id,
                            startTime: classInfo.startTime,
                            endTime: classInfo.endTime,
                            className: program.name,
                            details: classInfo.details,
                            instructor: program.instructor_name,
                            color: classInfo.color
                        });
                        classesContainer.appendChild(classElement);
                    }
                });
            });
        });
        enableDeleteMode();
        
    } catch (error) {
        console.error('수업 삭제 중 상세 오류:', error);
        alert(error.message || '수업 삭제 중 오류가 발생했습니다.');
    }
}

// 삭제 모드 활성화 함수
function enableDeleteMode() {
    document.querySelectorAll(".class").forEach((classElement) => {
        classElement.removeEventListener('click', editClickHandler);
        classElement.addEventListener('click', deleteClickHandler);
        classElement.style.cursor = "pointer";
        classElement.style.border = "2px solid #ff4d4d";
    });
}

// 삭제 모드 비활성화 함수
function disableDeleteMode() {
    document.querySelectorAll(".class").forEach((classElement) => {
        classElement.removeEventListener('click', deleteClickHandler);
        const id = classElement.getAttribute('data-id');
        const editHandler = (e) => {
            if (!deleteMode) {
                isEditing = true;
                currentProgramId = parseInt(id);
                openEditModal(parseInt(id));
            }
        };
        classElement.addEventListener('click', editHandler);
        classElement.style.cursor = "default";
        classElement.style.border = "none";
    });
}

function editClickHandler(e) {
    if (!deleteMode) {
        const id = e.currentTarget.getAttribute('data-id');
        isEditing = true;
        currentProgramId = parseInt(id);
        openEditModal(parseInt(id));
    }
}

function deleteClickHandler(e) {
    e.stopPropagation();
    const timeElement = e.currentTarget.querySelector(".time");
    const [startTime, endTime] = timeElement.textContent.split("~").map(t => t.trim());
    const dayElement = e.currentTarget.closest(".day");
    const day = dayElement.querySelector("h2").textContent;
    deleteClass(day, startTime, endTime);
}

// 수업 클릭 시 삭제 처리
function handleClassClick(event) {
    const classElement = event.currentTarget;
    const timeElement = classElement.querySelector(".time");
    const [startTime, endTime] = timeElement.textContent.split(" ~ ").map(t => t.trim());
    const dayElement = classElement.closest(".day");
    const day = dayElement.querySelector("h2").textContent;

    deleteClass(day, startTime, endTime);
}
const RESET_PASSWORD = "woody1234"; // 초기화 비밀번호 설정

async function resetClasses() {
    const userInput = prompt("초기화를 위해 비밀번호를 입력하세요:");

    if (userInput === null) {
        alert("초기화가 취소되었습니다.");
        return;
    }

    if (userInput === RESET_PASSWORD) {
        if (confirm("모든 수업을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            try {
                await API.deleteAllPrograms();
                
                classData = [];
                localStorage.removeItem("classData");
                
                document.querySelectorAll(".classes").forEach(container => {
                    container.innerHTML = "";
                });
                
                alert("모든 수업이 초기화되었습니다.");
                
            } catch (error) {
                console.error('수업 초기화 실패:', error);
                alert('수업 초기화에 실패했습니다: ' + error.message);
            }
        }
    } else {
        alert("비밀번호가 올바르지 않습니다. 초기화가 취소되었습니다.");
    }
}

let isPaletteOpen = false; // 팔레트 열림 상태

// 색상 팔레트 토글
function toggleColorPalette() {
    const palette = document.getElementById("color-palette");
    isPaletteOpen = !isPaletteOpen;
    palette.classList.toggle("hidden", !isPaletteOpen);
}


// 색상 선택 함수
function selectColor(color) {
    selectedColor = color;
    document.getElementById("color-preview").style.backgroundColor = color;
    toggleColorPalette();
}


async function checkTimeConflict(day, startTime, endTime, excludeProgramId = null) {
    try {
        const programs = await API.getPrograms();
        return programs.some(program => {
            if (excludeProgramId && program.id === parseInt(excludeProgramId)) {
                return false;
            }

            return program.classes.some(classInfo => {
                if (classInfo.day !== day) return false;

                const existingStart = convertTimeToMinutes(classInfo.startTime);
                const existingEnd = convertTimeToMinutes(classInfo.endTime);
                const newStart = convertTimeToMinutes(startTime);
                const newEnd = convertTimeToMinutes(endTime);

                return (newStart < existingEnd && newEnd > existingStart);
            });
        });
    } catch (error) {
        console.error('시간 충돌 확인 중 오류:', error);
        throw new Error('시간 충돌 확인 중 오류가 발생했습니다.');
    }
}

function convertTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}


async function addClass() {
  try {
    const classesPerWeek = parseInt(document.getElementById('classes-per-week').value) || 1;
    
    if (!classesPerWeek || classesPerWeek < 1) {
        alert('유효한 주간 수업 횟수를 입력해주세요.');
        return;
      }

    const schedules = getTimeSelections();

    if (schedules.length !== classesPerWeek) {
        alert(`주당 ${classesPerWeek}회로 설정하셨습니다. ${classesPerWeek}개의 시간을 선택해주세요. (현재 ${schedules.length}개 선택됨)`);
        return;
      }

      const programData = {
          name: document.getElementById('class-name').value.trim(),
          instructor_name: document.getElementById('instructor-name').value.trim() || null,
          monthly_price: parseInt(document.getElementById('monthly-price').value) || 0,
          per_class_price: parseInt(document.getElementById('per-class-price').value) || 0,
          classes_per_week: classesPerWeek,
          schedules: schedules,
          details: document.getElementById('class-details').value.trim(),
          color: selectedColor
      };

      if (!programData.name || !programData.schedules || !programData.monthly_price || 
        !programData.per_class_price || !programData.classes_per_week) {
        alert('수업명, 시간, 수강료는 필수 입력사항입니다.');
        return;
    }
    
    if (isNaN(programData.monthly_price) || programData.monthly_price <= 0) {
        alert('개월 수강료는 양수로 입력해주세요.');
        return;
    }
    
    if (isNaN(programData.per_class_price) || programData.per_class_price <= 0) {
        alert('회당 수강료는 양수로 입력해주세요.');
        return;
    }
    
    if (!programData.classes_per_week || programData.classes_per_week < 1 || programData.classes_per_week > 6) {
        alert('주간 수업 횟수를 1-6회 사이로 입력해주세요.');
        return;
    }

      await API.createProgram(programData);

      alert('수업이 성공적으로 등록되었습니다.');
      closeModal();
      await loadPrograms();
  } catch (error) {
      console.error('수업 등록 실패:', error);
      alert(error.message || '수업 등록에 실패했습니다. 다시 시도해주세요.');
  }
}
  
async function loadPrograms() {
    try {
        const programs = await API.getPrograms();
        document.querySelectorAll('.day .classes').forEach(container => {
            container.innerHTML = '';
        });

        programs.forEach(program => {
            program.classes?.forEach(classInfo => {
                const dayElements = document.querySelectorAll('.day');
                dayElements.forEach(dayElement => {
                    // 수업에서 저장된 축약형 요일을 전체 요일 이름으로 변환
                    const fullDayName = getFullDayName(classInfo.day);

                    const dayHeader = dayElement.querySelector('h2');
                    if (dayHeader && dayHeader.textContent.includes(fullDayName)) {
                        const classesContainer = dayElement.querySelector('.classes');
                        const classElement = createClassElement({
                            id: program.id,
                            startTime: classInfo.startTime,
                            endTime: classInfo.endTime,
                            className: program.name,
                            details: classInfo.details,
                            instructor: program.instructor_name,
                            color: classInfo.color
                        });
                        classesContainer.appendChild(classElement);
                    }
                });
            });
        });

        if (deleteMode) {
            disableDeleteMode();
        }
    } catch (error) {
        console.error('수업 목록 로드 실패:', error);
    }
}


  function resetForm() {
    document.getElementById('class-name').value = '';
    document.getElementById('class-details').value = '';
    document.getElementById('instructor-name').value = '';
    document.getElementById('monthly-price').value = '';
    document.getElementById('per-class-price').value = '';
    document.getElementById('classes-per-week').value = '1';
    document.getElementById('color-preview').style.backgroundColor = '#E56736';
    selectedColor = '#E56736';
    
    setupInitialTimeSelection();
  }
  
  // 페이지 로드 시 프로그램 목록 불러오기
  document.addEventListener('DOMContentLoaded', async () => {
    await loadPrograms();

    document.getElementById('classes-per-week').addEventListener('change', function(e) {
        const classesPerWeek = parseInt(e.target.value) || 1;
        const container = document.getElementById('time-selection-container');
        const currentSelections = container.querySelectorAll('.time-selection');
        
        if (currentSelections.length < classesPerWeek) {
            for (let i = currentSelections.length; i < classesPerWeek; i++) {
                addTimeSelection();
            }
        } else if (currentSelections.length > classesPerWeek) {
            for (let i = currentSelections.length - 1; i >= classesPerWeek; i--) {
                removeTimeSelection(i);
            }
        }
    });
  });


document.getElementById('modal-overlay').addEventListener('click', closeModal);
document.getElementById('class-modal').addEventListener('click', e => e.stopPropagation());

// 수업 렌더링 함수
function renderClasses() {
document.querySelectorAll('.classes').forEach(container => {
    container.innerHTML = ''; // 기존 데이터를 초기화
});

classData.forEach(data => {
    const { day, startTime, endTime, className, details, instructor,color:selectedColor } = data;
    const dayElement = Array.from(document.querySelectorAll('.day')).find(
    d => d.querySelector('h2').innerText === day
    );

    if (dayElement) {
        const classesContainer = dayElement.querySelector('.classes');
        const newClass = createClassElement({ startTime, endTime, className, details, instructor,color:selectedColor });
        classesContainer.appendChild(newClass);
    }
});
}

// 1시간 간격으로 선을 그릴 함수
function drawTimeLines() {
    // 화면 크기가 1000px 이하일 때만 선을 그린다
    if (window.innerWidth <= 1000) {
        const scheduleContainer = document.querySelector('.schedule');  // .schedule을 찾아서
        const rows = document.querySelectorAll('.time-slot');  // 각 시간대에 해당하는 div들 찾아서

        // 기존 선을 지운다
        scheduleContainer.querySelectorAll('.time-slot-line').forEach(line => line.remove());

        // 선을 13개까지만 그리도록 제한
        const totalLines = Math.min(rows.length, 13);  // 13개까지만 선을 그리도록

        for (let i = 0; i < totalLines; i++) {
            const linePosition = (i + 1) * 100;  // 1시간 간격마다 선 추가
            const line = document.createElement('div');
            line.className = 'time-slot-line';
            line.style.top = `${linePosition +3}px`;  // 각 시간대에 선을 맞춘다.
            scheduleContainer.appendChild(line);
        }
    }
}

// 화면 로드 시, 그리고 화면 크기 변경 시 선을 그리기
window.addEventListener('resize', drawTimeLines);  // 화면 크기 변경 시 선을 다시 그리기

function toggleSidebar() { 
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}
