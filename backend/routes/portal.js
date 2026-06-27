const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { read, write, interpolate, capitalizeSubject } = require('../db');

// Inbox - messages for the logged-in parent/student
router.get('/inbox', auth(['parent', 'student']), (req, res) => {
  const userId = req.user.id;
  const recipients = read('message_recipients').filter(r => r.user_id === userId);
  const messages = read('messages');
  const type = req.query.type;
  const student = read('students').find(s => s.id === req.user.linked_student_id);
  
  let result = recipients.map(r => {
    const msg = messages.find(m => m.id === r.message_id);
    if (!msg) return null;
    return { 
      ...msg, 
      subject: capitalizeSubject(interpolate(msg.subject, student)),
      body_html: interpolate(msg.body_html || msg.body, student),
      delivery_status: r.delivery_status, 
      read_at: r.read_at, 
      recipient_id: r.id 
    };
  }).filter(Boolean);
  if (type) result = result.filter(m => m.message_type === type);
  res.json(result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

// Single message - mark as read
router.get('/inbox/:id', auth(['parent', 'student']), (req, res) => {
  const userId = req.user.id;
  const msgId = parseInt(req.params.id);
  const recipients = read('message_recipients');
  const idx = recipients.findIndex(r => r.message_id === msgId && r.user_id === userId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (!recipients[idx].read_at) {
    recipients[idx].read_at = new Date().toISOString();
    recipients[idx].delivery_status = 'read';
    write('message_recipients', recipients);
  }
  const msg = read('messages').find(m => m.id === msgId);
  if (!msg) return res.status(404).json({ error: 'Not found' });
  const student = read('students').find(s => s.id === req.user.linked_student_id);
  res.json({ 
    ...msg, 
    subject: capitalizeSubject(interpolate(msg.subject, student)),
    body_html: interpolate(msg.body_html || msg.body, student),
    ...recipients[idx] 
  });
});

// Attendance for parent/student
router.get('/attendance', auth(['parent', 'student']), (req, res) => {
  const { linked_student_id } = req.user;
  if (!linked_student_id) return res.status(400).json({ error: 'No linked student' });
  const records = read('attendance').filter(r => r.student_id === linked_student_id);
  const student = read('students').find(s => s.id === linked_student_id);
  const total = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  res.json({ student, records, stats: { total, present, absent, percentage } });
});

// Fee status (mock)
router.get('/fees', auth(['parent', 'student']), (req, res) => {
  res.json({
    status: 'due',
    amount_due: 12500,
    due_date: '2026-07-15',
    term: 'July 2026',
    history: [
      { date: '2026-04-10', description: 'Term 1 Fee', amount: 12500, receipt_no: 'RCP001', status: 'paid' },
      { date: '2026-01-08', description: 'Term 2 Fee', amount: 12500, receipt_no: 'RCP002', status: 'paid' }
    ]
  });
});

module.exports = router;
