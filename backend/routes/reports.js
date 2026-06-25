const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { read } = require('../db');

router.get('/stats', auth(['super_admin', 'staff']), (req, res) => {
  const messages = read('messages');
  const byType = {};
  messages.forEach(m => { byType[m.message_type] = (byType[m.message_type] || 0) + 1; });
  const byStatus = {};
  messages.forEach(m => { byStatus[m.status] = (byStatus[m.status] || 0) + 1; });
  const totalRecipients = messages.reduce((s, m) => s + (m.recipients_count || 0), 0);
  const totalDelivered = messages.reduce((s, m) => s + (m.delivered_count || 0), 0);
  const deliveryRate = totalRecipients > 0 ? Math.round((totalDelivered / totalRecipients) * 100) : 0;
  res.json({ byType, byStatus, totalRecipients, totalDelivered, deliveryRate, totalMessages: messages.length });
});

module.exports = router;
