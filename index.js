document.addEventListener('DOMContentLoaded', () => {
   const calendarContainer = document.getElementById('calendar');
   const yearSelect = document.getElementById('year-select');
   const initialShiftSelect = document.getElementById('initial-shift');
   const closingDaysInput = document.getElementById('closing-days');
   const workingHolidaysInput = document.getElementById('working-holidays');
   const generateScheduleButton = document.getElementById('generate-schedule');
   const updateCalendarButton = document.getElementById('update-calendar');
   const exportToExcelButton = document.getElementById('export-to-excel');

   // Inicializa Flatpickr para los campos de fecha
   flatpickr("#closing-days, #working-holidays", {
       mode: "multiple",
       dateFormat: "Y-m-d"
   });

   yearSelect.addEventListener('change', () => {
       createCalendar(parseInt(yearSelect.value));
   });

   generateScheduleButton.addEventListener('click', generateSchedule);
   updateCalendarButton.addEventListener('click', updateSpecialDays);
   exportToExcelButton.addEventListener('click', exportToExcel);

   document.getElementById('print-calendar').addEventListener('click', function() {
       window.print();
   });

   function createCalendar(year) {
       calendarContainer.innerHTML = '';
       const months = [
           'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
       ];
       const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

       for (let month = 0; month < 12; month++) {
           const monthDiv = document.createElement('div');
           monthDiv.className = 'month';

           const monthHeader = document.createElement('h3');
           monthHeader.textContent = months[month];
           monthDiv.appendChild(monthHeader);

           const daysDiv = document.createElement('div');
           daysDiv.className = 'days';

           for (const day of daysOfWeek) {
               const dayHeader = document.createElement('div');
               dayHeader.className = 'day header';
               dayHeader.textContent = day;
               daysDiv.appendChild(dayHeader);
           }

           const firstDay = new Date(year, month, 1).getDay();
           const daysInMonth = new Date(year, month + 1, 0).getDate();

           for (let i = 0; i < firstDay; i++) {
               const emptyDay = document.createElement('div');
               emptyDay.className = 'day';
               daysDiv.appendChild(emptyDay);
           }

           for (let day = 1; day <= daysInMonth; day++) {
               const dayDiv = document.createElement('div');
               dayDiv.className = 'day';
               const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
               dayDiv.setAttribute('data-date', date);
               daysDiv.appendChild(dayDiv);
           }

           monthDiv.appendChild(daysDiv);
           calendarContainer.appendChild(monthDiv);
       }
   }

   function generateSchedule() {
       const year = parseInt(yearSelect.value);
       const startShift = initialShiftSelect.value;
       const shifts = ['morning', 'afternoon', 'night', 'off'];
       const shiftIcons = {
           'morning': '<i class="fas fa-sun icon"></i>',
           'afternoon': '<i class="fas fa-cloud-sun icon"></i>',
           'night': '<i class="fas fa-moon icon"></i>',
           'off': '<i class="fas fa-bed icon"></i>',
           'closing': '<i class="fas fa-times-circle icon"></i>',
           'working-holiday': '<i class="fas fa-briefcase icon"></i>'
       };

       let currentIndex = shifts.indexOf(startShift);
       let shiftCounter = 0;
       const weekendDays = [5, 6, 0]; // Friday, Saturday, Sunday

       document.querySelectorAll('.day[data-date]').forEach(day => {
           const date = day.getAttribute('data-date');
           const isWeekend = weekendDays.includes(new Date(date).getDay());

           day.className = `day ${shifts[currentIndex]}`; // Reseteamos las clases antes de añadir nuevas
           day.innerHTML = `${new Date(date).getDate()} ${shiftIcons[shifts[currentIndex]]}`;
           shiftCounter++;

           if (isWeekend) {
               if (shiftCounter % 3 === 0) {
                   currentIndex = (currentIndex + 1) % shifts.length;
                   shiftCounter = 0;
               }
           } else {
               if (shiftCounter % 2 === 0) {
                   currentIndex = (currentIndex + 1) % shifts.length;
                   shiftCounter = 0;
               }
           }
       });
   }

   function updateSpecialDays() {
       const closingDays = closingDaysInput.value.split(',').map(date => date.trim());
       const workingHolidays = workingHolidaysInput.value.split(',').map(date => date.trim());
       const shiftIcons = {
           'morning': '<i class="fas fa-sun icon"></i>',
           'afternoon': '<i class="fas fa-cloud-sun icon"></i>',
           'night': '<i class="fas fa-moon icon"></i>',
           'off': '<i class="fas fa-bed icon"></i>',
           'closing': '<i class="fas fa-times-circle icon"></i>',
           'working-holiday': '<i class="fas fa-briefcase icon"></i>'
       };

       document.querySelectorAll('.day[data-date]').forEach(day => {
           const date = day.getAttribute('data-date');
           const dayNumber = new Date(date).getDate();
           const originalClassName = day.className.replace(/ closing| working-holiday/g, '').trim();

           if (closingDays.includes(date)) {
               day.className = `${originalClassName} closing`;
               day.innerHTML = `${dayNumber} ${shiftIcons['closing']}`;
           } else if (workingHolidays.includes(date)) {
               day.className = `${originalClassName} working-holiday`;
               day.innerHTML = `${dayNumber} ${shiftIcons['working-holiday']}`;
           } else {
               day.className = originalClassName;
               day.innerHTML = `${dayNumber} ${shiftIcons[originalClassName.split(' ')[1]] || ''}`.trim();
           }
       });
   }



   function exportToExcel() {
       const table = document.createElement('table');
       table.border = '1';

       document.querySelectorAll('.month').forEach(monthDiv => {
           const monthRow = table.insertRow();
           const monthCell = monthRow.insertCell();
           monthCell.colSpan = 7;
           monthCell.textContent = monthDiv.querySelector('h3').textContent;
           monthCell.style.textAlign = 'center';
           monthCell.style.fontWeight = 'bold';
           monthCell.style.backgroundColor = '#007bff';
           monthCell.style.color = '#fff';

           const daysHeaderRow = table.insertRow();
           monthDiv.querySelectorAll('.day.header').forEach(dayHeader => {
               const headerCell = daysHeaderRow.insertCell();
               headerCell.textContent = dayHeader.textContent;
               headerCell.style.fontWeight = 'bold';
               headerCell.style.backgroundColor = '#f3f3f3';
           });

           let weekRow;
           monthDiv.querySelectorAll('.day').forEach((day, index) => {
               if (index % 7 === 0) {
                   weekRow = table.insertRow();
               }
               const dayCell = weekRow.insertCell();
               dayCell.innerHTML = day.innerHTML;
               dayCell.style.textAlign = 'center';
           });
       });

       const data = table.outerHTML;
       const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `Calendario_${yearSelect.value}.xls`;
       a.click();
       window.URL.revokeObjectURL(url);
   }

   createCalendar(parseInt(yearSelect.value));
});
