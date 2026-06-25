const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { read, write, nextId } = require('../db');

router.get('/', auth(['super_admin', 'staff']), (req, res) => {
  let records = read('attendance');
  const { class_name, date, student_id } = req.query;
  const students = read('students');
  if (class_name) {
    const classStudents = students.filter(s => s.class_name === class_name);
    const classIds = classStudents.map(s => s.id);
    records = records.filter(r => classIds.includes(r.student_id));
    if (date) records = records.filter(r => r.date === date);
    // Build result including students with no records for that date
    const result = classStudents.map(s => {
      const rec = records.find(r => r.student_id === s.id);
      return rec ? { ...rec, student: s } : { student_id: s.id, date: date || null, status: null, student: s };
    });
    return res.json(result);
  }
  if (date) records = records.filter(r => r.date === date);
  if (student_id) records = records.filter(r => r.student_id === parseInt(student_id));
  const result = records.map(r => ({ ...r, student: students.find(s => s.id === r.student_id) }));
  res.json(result);
});

router.get('/student/:id', auth(['super_admin', 'staff', 'parent', 'student']), (req, res) => {
  const records = read('attendance').filter(r => r.student_id === parseInt(req.params.id));
  const student = read('students').find(s => s.id === parseInt(req.params.id));
  const total = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  res.json({ student, records, stats: { total, present, absent, percentage } });
});

router.post('/bulk', auth(['super_admin', 'staff']), (req, res) => {
  const { class_name, date, period, records: incoming } = req.body;
  const attendance = read('attendance');
  const students = read('students');
  incoming.forEach(r => {
    const student = students.find(s => s.roll_number === r.roll_number);
    if (!student) return;
    const existing = attendance.findIndex(a => a.student_id === student.id && a.date === date);
    const entry = { id: nextId(attendance), student_id: student.id, date, status: r.status, marked_by: req.user.id, period: period || 'Full Day' };
    if (existing >= 0) attendance[existing] = { ...attendance[existing], status: r.status };
    else attendance.push(entry);
  });
  write('attendance', attendance);
  res.json({ success: true, count: incoming.length });
});

module.exports = router;
