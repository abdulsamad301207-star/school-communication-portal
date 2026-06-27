const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

function read(file) {
  const p = path.join(DATA_DIR, `${file}.json`);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function write(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, `${file}.json`), JSON.stringify(data, null, 2));
}

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(r => r.id)) + 1 : 1;
}

function interpolate(text, student) {
  if (!text) return '';
  if (typeof text !== 'string') text = String(text);
  
  // Clean duplicate greetings
  text = text.replace(/Dear Parent,?\s+We hope this message finds you well\.?\s+Dear Parents?,?/gi, "Dear Parent,\n\nWe hope this message finds you well. ");
  
  // Fee data
  let feeRecord = null;
  if (student) {
    const studentIdKey = `s${student.id}`;
    feeRecord = read('fees').find(f => f.student_id === studentIdKey || String(f.student_id) === String(student.id));
  }
  const amountVal = feeRecord ? (feeRecord.balance !== undefined ? feeRecord.balance : feeRecord.total_due) : 12500;
  // Format amount with comma if it's a number
  const amountStr = typeof amountVal === 'number' ? amountVal.toLocaleString('en-IN') : amountVal;

  let feeMonth = 'July';
  let feeYear = '2026';
  let dueDateStr = '15th July 2026';
  if (feeRecord && feeRecord.due_date) {
    const d = new Date(feeRecord.due_date);
    if (!isNaN(d.getTime())) {
      feeMonth = d.toLocaleString('default', { month: 'long' });
      feeYear = d.getFullYear().toString();
      const day = d.getDate();
      let suffix = 'th';
      if (day === 1 || day === 21 || day === 31) suffix = 'st';
      else if (day === 2 || day === 22) suffix = 'nd';
      else if (day === 3 || day === 23) suffix = 'rd';
      dueDateStr = `${day}${suffix} ${feeMonth} ${feeYear}`;
    }
  }

  // Attendance data
  let currentAttPct = 78;
  if (student) {
    const attendanceRecords = read('attendance').filter(r => r.student_id === student.id);
    const totalAtt = attendanceRecords.length;
    const presentAtt = attendanceRecords.filter(r => r.status === 'present').length;
    currentAttPct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;
  }
  const thresholdPct = 75;

  const exam_name = "Final Term Examinations";
  const timetable = `<ul>
    <li>Mathematics — 15 June</li>
    <li>Science — 16 June</li>
    <li>English — 17 June</li>
    <li>Social Studies — 18 June</li>
  </ul>`;
  const event_name = "Annual Sports Meet 2026";
  const dateVal = "20th June 2026";
  const detailsVal = "The event will be held at the school grounds from 9:00 AM to 1:00 PM.";

  const studentName = student ? student.name : 'Student';
  const studentRoll = student ? student.roll_number : 'STU001';
  const className = student ? student.class_name : '10A';
  const campus = student ? student.campus : 'Main Campus';

  return text
    .replace(/\{\{student_name\}\}/g, studentName)
    .replace(/\{\{student_roll\}\}/g, studentRoll)
    .replace(/\{\{class_name\}\}/g, className)
    .replace(/\{\{campus\}\}/g, campus)
    .replace(/\{\{month\}\}/g, feeMonth)
    .replace(/\{\{year\}\}/g, feeYear)
    .replace(/\{\{due_date\}\}/g, dueDateStr)
    .replace(/\{\{amount\}\}/g, amountStr)
    .replace(/\{\{threshold\}\}/g, thresholdPct.toString())
    .replace(/\{\{current\}\}/g, currentAttPct.toString())
    .replace(/\{\{exam_name\}\}/g, exam_name)
    .replace(/\{\{timetable\}\}/g, timetable)
    .replace(/\{\{event_name\}\}/g, event_name)
    .replace(/\{\{date\}\}/g, dateVal)
    .replace(/\{\{details\}\}/g, detailsVal);
}

function capitalizeSubject(subject) {
  if (!subject) return '';
  if (typeof subject !== 'string') subject = String(subject);
  if (subject.toLowerCase() === 'attendance') return 'Attendance Alert';
  return subject.charAt(0).toUpperCase() + subject.slice(1);
}

module.exports = { read, write, nextId, interpolate, capitalizeSubject };
