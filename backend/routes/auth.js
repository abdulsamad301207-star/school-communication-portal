const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { read } = require('../db');

router.post('/login', (req, res) => {
  const { email, password, roll_number } = req.body;
  const users = read('users');
  let user;

  if (roll_number) {
    const students = read('students');
    const student = students.find(s => s.roll_number === roll_number);
    if (!student) return res.status(401).json({ error: 'Invalid credentials' });
    // Find the user account linked to this student
    user = users.find(u => u.role === 'student' && u.linked_student_id === student.id);
    if (!user) user = users.find(u => u.role === 'student' && u.email === `${roll_number.toLowerCase()}@sgei.edu.in`);
  } else {
    user = users.find(u => u.email === email?.toLowerCase());
  }

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  // For demo: plain password comparison (in production use bcrypt.compare)
  const valid = password === user.password_plain;
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, campus: user.campus, linked_student_id: user.linked_student_id },
    process.env.JWT_SECRET || 'sgei_secret',
    { expiresIn: '8h' }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, campus: user.campus } });
});

router.post('/logout', (req, res) => res.json({ message: 'Logged out' }));

module.exports = router;
