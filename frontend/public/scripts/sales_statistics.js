let monthlyChart = null;
let programChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadData();
});

function setupEventListeners() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');

    yearSelect.innerHTML = '';

    const years = [2024, 2025];
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}년`;
        yearSelect.appendChild(option);
    });

    const currentYear = new Date().getFullYear();
    yearSelect.value = currentYear;
    
    const currentMonth = new Date().getMonth() + 1;
    monthSelect.value = currentMonth;

    yearSelect.addEventListener('change', () => {
        console.log('연도 변경:', yearSelect.value);
        loadData();
    });

    monthSelect.addEventListener('change', loadData);
    
    loadData();
}

async function loadData() {
    try {
        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;

        const monthlyResponse = await fetch(`https://membership-management-production.up.railway.app/api/statistics/monthly?year=${year}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!monthlyResponse.ok) {
            throw new Error('월별 통계 데이터 로드 실패');
        }

        const monthlyStats = await monthlyResponse.json();
        const yearlyData = monthlyStats;
        const monthlyData = yearlyData.filter(item => {
            const itemMonth = parseInt(item.month.split('-')[1]);
            return itemMonth === parseInt(month);
        });

        updateSalesTable(monthlyData);
        updateMonthlyChart(yearlyData);

    } catch (error) {
        console.error('데이터 로드 오류:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

function filterDataByYear(data, year) {
    return data.filter(item => {
        const itemYear = item.month.split('-')[0];
        return itemYear === year.toString();
    });
}

function filterDataByMonth(data, month) {
    return data.filter(item => {
        const itemMonth = parseInt(item.month.split('-')[1]);
        return itemMonth === parseInt(month);
    });
}
function formatCurrency(amount) {
    return Number(amount || 0).toLocaleString('ko-KR');
}

function updateSalesTable(monthlyData, yearlyData) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';
    
    const yearSelect = document.getElementById('yearSelect').value;
    const monthSelect = document.getElementById('monthSelect').value;
    
    let monthlyPaidTotal = 0;
    let monthlyUnpaidTotal = 0;
    let yearlyTotal = 0;

    if (monthlyData[0]?.paid_amount > 0) {
        const trPaid = document.createElement('tr');
        monthlyPaidTotal = Number(monthlyData[0].paid_amount || 0);
        trPaid.innerHTML = `
            <td>${formatCurrency(monthlyData[0].paid_amount)}원</td>
            <td>${monthlyData[0].month}</td>
            <td>완납</td>
        `;
        tbody.appendChild(trPaid);
    }

    if (monthlyData[0]?.unpaid_amount > 0) {
        const trUnpaid = document.createElement('tr');
        monthlyUnpaidTotal = Number(monthlyData[0].unpaid_amount || 0);
        trUnpaid.innerHTML = `
            <td>${formatCurrency(monthlyData[0].unpaid_amount)}원</td>
            <td>${monthlyData[0].month}</td>
            <td>미납</td>
        `;
        tbody.appendChild(trUnpaid);
    }

    if (yearlyData && yearlyData.length > 0) {
        yearlyTotal = yearlyData.reduce((sum, data) => sum + Number(data.revenue || 0), 0);
    }
    const monthlyTotalRevenue = monthlyPaidTotal + monthlyUnpaidTotal;

    const summaryElement = document.querySelector('.summary');
    if (summaryElement) {
        summaryElement.innerHTML = `
            ${yearSelect}년 총매출: ${formatCurrency(yearlyTotal)}원<br>
            ${yearSelect}년 ${monthSelect}월 총매출: ${formatCurrency(monthlyTotalRevenue)}원
        `;
    }
}

function updateMonthlyChart(data) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    if (monthlyChart) {
        monthlyChart.destroy();
    }

    monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data && data.length > 0 ? Object.keys(groupDataByMonth(data)).sort() : [],
            datasets: [{
                label: '월별 매출 (원)',
                data: data && data.length > 0 ? Object.values(groupDataByMonth(data)) : [],
                borderColor: '#E56736',
                backgroundColor: 'rgba(229, 103, 54, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `매출: ${formatCurrency(context.raw)}원`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value) + '원';
                        }
                    }
                }
            }
        }
    });
}

function groupDataByMonth(data) {
    return data.reduce((acc, item) => {
        if (!acc[item.month]) {
            acc[item.month] = 0;
        }
        acc[item.month] += Number(item.revenue || 0);
        return acc;
    }, {});
}

async function loadData() {
    try {
        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;
        console.log('선택된 연도:', year);

        const monthlyResponse = await fetch(`https://membership-management-production.up.railway.app/api/statistics/monthly?year=${year}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!monthlyResponse.ok) {
            throw new Error('월별 통계 데이터 로드 실패');
        }

        const monthlyStats = await monthlyResponse.json();
        const yearlyData = monthlyStats;
        const monthlyData = yearlyData.filter(item => {
            const itemMonth = parseInt(item.month.split('-')[1]);
            return itemMonth === parseInt(month);
        });

        updateSalesTable(monthlyData, yearlyData);
        updateMonthlyChart(yearlyData);

        const programResponse = await fetch(`https://membership-management-production.up.railway.app/api/statistics/program?year=${year}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!programResponse.ok) {
            throw new Error('수업별 통계 데이터 로드 실패');
        }

        const programStats = await programResponse.json();
        updateProgramChart(programStats);

    } catch (error) {
        console.error('데이터 로드 오류:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

function updateProgramChart(data) {
    const ctx = document.getElementById('serviceChart').getContext('2d');
    
    if (programChart) {
        programChart.destroy();
    }

    const colors = ['#DF4420', '#C33A20', '#E56736', '#EE8B59'];

    programChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.name || '수업명 없음'),
            datasets: [{
                label: '수업별 매출 (원)',
                data: data.map(item => Number(item.revenue || 0)),
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (!data || !data[context.dataIndex]) return [];
                            const revenue = data[context.dataIndex].revenue;
                            const studentCount = data[context.dataIndex].total_students;
                            return [
                                `매출: ${formatCurrency(revenue)}원`,
                                `수강생: ${studentCount}명`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value) + '원';
                        }
                    }
                }
            }
        }
    });
}