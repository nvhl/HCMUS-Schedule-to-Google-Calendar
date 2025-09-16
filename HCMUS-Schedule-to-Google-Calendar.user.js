// ==UserScript==
// @name         HCMUS Schedule to Google Calendar
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Một UserScript giúp sinh viên HCMUS đồng bộ hóa thời khóa biểu từ trang portal sang Google Calendar.
// @author       HoangLong - SV K25 Nhom nganh MT&CNTT
// @updateURL    https://github.com/nvhl/HCMUS-Schedule-to-Google-Calendar/raw/refs/heads/main/HCMUS-Schedule-to-Google-Calendar.user.js
// @match        https://new-portal*.hcmus.edu.vn/SinhVien.aspx?pid=212*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CẤU HÌNH ---
    const SO_TUAN_HOC_DEFAULT = 15;

    const TIME_MAP_CS2 = { // Cơ sở 2 (Linh Trung)
        '1': { start: '07:30', end: '08:20' }, '2': { start: '08:20', end: '09:10' },
        "2.5": { end: '09:35'}, '3': { start: '09:10', end: '10:00' },
        "3.5": { start: '09:45'}, '4': { start: '10:10', end: '11:00' },
        '5': { start: '11:00', end: '11:50' }, '6': { start: '12:40', end: '13:30' },
        '7': { start: '13:30', end: '14:20' }, "7.5": { end: '14:45'},
        '8': { start: '14:20', end: '15:10' }, "8.5": { start: '14:55'},
        '9': { start: '15:20', end: '16:10' }, '10': { start: '16:10', end: '17:00' },
    };

    const TIME_MAP_CS1 = { // Cơ sở 1 (Nguyễn Văn Cừ)
        '1': { start: '07:00', end: '07:50' }, '2': { start: '07:50', end: '08:40' },
        '3': { start: '08:40', end: '09:30' }, '4': { start: '09:40', end: '10:30' },
        '5': { start: '10:30', end: '11:20' }, '6': { start: '11:20', end: '12:10' },
        '7': { start: '12:50', end: '13:40' }, '8': { start: '13:40', end: '14:30' },
        '9': { start: '14:30', end: '15:20' }, '10': { start: '15:30', end: '16:20' },
        '11': { start: '16:20', end: '17:10' }, '12': { start: '17:10', end: '18:00' },
        '13': { start: '18:00', end: '18:50' }, '14': { start: '18:50', end: '19:40' },
        '15': { start: '19:40', end: '20:30' }
    };
    // --------------------------------------------------------------------------------

    const WDAY_MAP = { 'T2': 'MO', 'T3': 'TU', 'T4': 'WE', 'T5': 'TH', 'T6': 'FR', 'T7': 'SA', 'CN': 'SU' };

    function addCalendarColumn(table) {
        if (table.querySelector(`th[data-userscript-column='true']`)) return;

        const headerRow = table.querySelector('thead tr');
        const newHeader = document.createElement('th');
        newHeader.className = 'ui-state-default';
        newHeader.innerHTML = `<div class="DataTables_sort_wrapper" style="cursor: pointer;">Google Calendar</div>`;
        newHeader.setAttribute('data-userscript-column', 'true');
        newHeader.title = "Nhấp để tải lại link";
        newHeader.style.width = '130px';
        headerRow.appendChild(newHeader);

        newHeader.addEventListener('click', () => {
            console.log("Reloading Google Calendar links...");
            table.querySelectorAll('tbody tr').forEach(row => {
                const calendarCell = row.cells[row.cells.length - 1];
                if (calendarCell) calendarCell.innerHTML = '';
            });
            processAndGenerateLinks();
        });

        table.querySelectorAll('tbody tr').forEach(row => {
            row.appendChild(document.createElement('td')).className = 'center';
        });
    }

    function parseScheduleString(scheduleStr) {
        const regex = /(T[2-7]|CN)\(([\d.]+)\-([\d.]+)\)(?:-P\.(cs[12]):(.+))?/;
        const match = scheduleStr.match(regex);
        if (!match) return null;
        const [_, day, startPeriod, endPeriod, campus, room] = match;
        const campusId = campus || 'cs2';
        const location = campus ? `Cơ sở ${campus.replace('cs', '')}, Phòng ${room.trim()}` : 'N/A';
        return { day, startPeriod, endPeriod, location, campusId };
    }

    function formatDateLocal(date, time) {
        const [hours, minutes] = time.split(':');
        const pad = (n) => n.toString().padStart(2, '0');
        const d = new Date(date);
        d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    }

    function createGoogleCalendarLink(info) {
        const { fullSubjectName, day, startPeriod, endPeriod, location, scheduleStr, campusId, startDateText, subjectCode, classGroup } = info;
        const timeMap = campusId === 'cs1' ? TIME_MAP_CS1 : TIME_MAP_CS2;
        const startTime = timeMap[startPeriod]?.start ?? timeMap[Math.ceil(parseFloat(startPeriod))]?.start;
        const endTime = timeMap[endPeriod]?.end ?? timeMap[Math.floor(parseFloat(endPeriod))]?.end;
        const weekday = WDAY_MAP[day];

        if (!startTime || !endTime || !weekday) {
             console.warn("Bỏ qua lịch không hợp lệ:", {scheduleStr, startTime, endTime});
             return null;
        }

        const today = new Date();
        const firstPossibleDate = new Date();
        let remainingWeeks = SO_TUAN_HOC_DEFAULT;

        if (startDateText) {
            const [dayStr, monthStr, yearStr] = startDateText.split('/');
            const baseStartDate = new Date(`${yearStr}-${monthStr}-${dayStr}T00:00:00`);
            const targetDayIndex = Object.keys(WDAY_MAP).indexOf(day);
            const baseStartDayIndex = (baseStartDate.getDay() + 6) % 7;
            let dayDifference = targetDayIndex - baseStartDayIndex;
            if (dayDifference < 0) dayDifference += 7;
            firstPossibleDate.setTime(baseStartDate.getTime());
            firstPossibleDate.setDate(baseStartDate.getDate() + dayDifference);

            // Tính số tuần đã trôi qua so với ngày học đầu tiên
            if (today > firstPossibleDate) {
                const weeksPassed = Math.floor((today.getTime() - firstPossibleDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
                remainingWeeks = SO_TUAN_HOC_DEFAULT - weeksPassed;
            }
        } else {
            // Fallback: Lên lịch cho tuần tới nếu không có ngày bắt đầu
            const targetDayIndex = Object.keys(WDAY_MAP).indexOf(day);
            const currentDayIndex = (today.getDay() + 6) % 7;
            let dayDifference = targetDayIndex - currentDayIndex;
            if (dayDifference < 0) dayDifference += 7;
            firstPossibleDate.setDate(today.getDate() + dayDifference);
        }

        const count = Math.max(1, remainingWeeks);
        const startDateStr = formatDateLocal(firstPossibleDate, startTime);
        const endDateStr = formatDateLocal(firstPossibleDate, endTime);
        const description = `Mã MH: ${subjectCode}\nLớp/Nhóm: ${classGroup}\nLịch học gốc: ${scheduleStr}`;

        const url = new URL('https://calendar.google.com/calendar/render');
        url.searchParams.set('action', 'TEMPLATE');
        url.searchParams.set('text', fullSubjectName);
        url.searchParams.set('dates', `${startDateStr}/${endDateStr}`);
        url.searchParams.set('location', location);
        url.searchParams.set('details', description);
        url.searchParams.set('recur', `RRULE:FREQ=WEEKLY;COUNT=${count};BYDAY=${weekday}`);
        return url.toString();
    }

    function processAndGenerateLinks() {
        const config = {
            tableId: 'tbSVKQ', subjectCodeIndex: 0, nameIndex: 1, classGroupIndex: 2,
            classTypeIndex: 4, scheduleIndex: 5, startDateIndex: 6,
        };
        const table = document.getElementById(config.tableId);
        if (!table) { console.error("Không tìm thấy bảng 'tbSVKQ'."); return; }

        addCalendarColumn(table);
        let generatedCount = 0;

        table.querySelectorAll('tbody tr').forEach(row => {
            const calendarCell = row.cells[row.cells.length - 1];
            if (calendarCell.innerHTML !== '') return;

            const subjectCodeCell = row.cells[config.subjectCodeIndex];
            const subjectCell = row.cells[config.nameIndex];
            const classGroupCell = row.cells[config.classGroupIndex];
            const classTypeCell = row.cells[config.classTypeIndex];
            const scheduleCell = row.cells[config.scheduleIndex];
            const startDateCell = row.cells[config.startDateIndex];

            if (subjectCell && scheduleCell) {
                const subjectName = subjectCell.textContent.trim();
                const classType = classTypeCell ? classTypeCell.textContent.trim() : '';
                const fullSubjectName = classType ? `${subjectName} (${classType})` : subjectName;
                const scheduleStr = scheduleCell.textContent.trim();
                const startDateText = startDateCell ? startDateCell.textContent.trim() : null;
                const subjectCode = subjectCodeCell ? subjectCodeCell.textContent.trim() : '';
                const classGroup = classGroupCell ? classGroupCell.textContent.trim() : '';

                scheduleStr.split(';').map(s => s.trim()).forEach((part, index) => {
                    const parsedInfo = parseScheduleString(part);
                    if (parsedInfo) {
                        const link = createGoogleCalendarLink({ ...parsedInfo, fullSubjectName, scheduleStr: part, startDateText, subjectCode, classGroup });
                        if (link) {
                            const a = document.createElement('a');
                            a.href = link;
                            a.textContent = 'Thêm vào lịch';
                            a.title = `Thêm '${fullSubjectName}' vào Lịch`;
                            a.target = '_blank';
                            a.style.cssText = 'display: inline-block; padding: 3px 6px; background-color: #e8e8e8; border: 1px solid #ccc; border-radius: 4px; text-decoration: none; color: #333;';
                            calendarCell.appendChild(a);
                            generatedCount++;
                        }
                    }
                });
            }
        });
        if (generatedCount > 0) console.log(`Đã tạo ${generatedCount} link Google Calendar.`);
    }
    setTimeout(processAndGenerateLinks, 700);
})();
