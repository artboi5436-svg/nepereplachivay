/**
 * Модуль генерации файлов календаря .ics (iCalendar RFC 5545).
 * Позволяет экспортировать напоминания об окончании промо-периодов и датах списаний.
 */

function formatIcsDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Создает и скачивает iCal-файл с напоминаниями.
 * @param {Array<{ title: string, description: string, date: Date, durationHours?: number }>} events
 * @param {string} filename
 */
export function exportEventsToIcs(events = [], filename = 'ne-pereplachivay-reminders.ics') {
  if (events.length === 0) {
    alert('Нет активных напоминаний для экспорта в календарь.');
    return;
  }

  const nowStr = formatIcsDate(new Date());

  const vEvents = events.map((ev, idx) => {
    const startStr = formatIcsDate(ev.date);
    const endDate = new Date(ev.date.getTime() + (ev.durationHours || 1) * 60 * 60 * 1000);
    const endStr = formatIcsDate(endDate);
    const uid = `reminder-${Date.now()}-${idx}@nepereplachivay.ru`;

    // Экранирование текста по стандарту RFC 5545
    const cleanTitle = (ev.title || 'Напоминание').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const cleanDesc = (ev.description || '').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${cleanTitle}`,
      `DESCRIPTION:${cleanDesc}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P1D', // Напоминание за 1 день до события
      'ACTION:DISPLAY',
      `DESCRIPTION:Напоминание: ${cleanTitle}`,
      'END:VALARM',
      'END:VEVENT'
    ].join('\r\n');
  }).join('\r\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ne Pereplachivay//Ru//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    vEvents,
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
