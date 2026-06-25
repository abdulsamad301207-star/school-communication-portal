const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { read } = require('../db');

router.get('/stats', auth(['super_admin', 'staff']), (req, res) => {
  const messages = read('messages');
  const today = new Date().toISOString().slice(0, 10);
  const sentToday = messages.filter(m => m.sent_at && m.sent_at.startsWith(today)).length;
  const totalDelivered = messages.reduce((s, m) => s + (m.delivered_count || 0), 0);
  const totalRecipients = messages.reduce((s, m) => s + (m.recipients_count || 0), 0);
  const pending = messages.filter(m => m.status === 'scheduled').length;
  res.json({ sentToday, totalDelivered, totalRecipients, pending });
});

module.exports = router;
