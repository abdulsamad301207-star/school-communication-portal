const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { read, write, nextId, interpolate, capitalizeSubject } = require('../db');

router.get('/', auth(['super_admin', 'staff']), (req, res) => {
  let messages = read('messages');
  const { type, status, search } = req.query;
  if (type) messages = messages.filter(m => m.message_type === type);
  if (status) messages = messages.filter(m => m.status === status);
  if (search) messages = messages.filter(m => (m.subject || '').toString().toLowerCase().includes(search.toLowerCase()));
  const result = messages.map(m => ({
    ...m,
    subject: capitalizeSubject(interpolate(m.subject, null)),
    body_html: interpolate(m.body_html || m.body, null)
  }));
  res.json(result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

router.get('/:id', auth(['super_admin', 'staff']), (req, res) => {
  const messages = read('messages');
  const msg = messages.find(m => m.id === parseInt(req.params.id));
  if (!msg) return res.status(404).json({ error: 'Not found' });
  const recipients = read('message_recipients').filter(r => r.message_id === msg.id);
  res.json({ 
    ...msg, 
    subject: capitalizeSubject(interpolate(msg.subject, null)),
    body_html: interpolate(msg.body_html || msg.body, null),
    recipients 
  });
});

router.post('/', auth(['super_admin', 'staff']), (req, res) => {
  const messages = read('messages');
  const { subject, message_type, body_html, attachment_url, status, scheduled_at, recipients_count } = req.body;
  const newMsg = {
    id: nextId(messages),
    subject, message_type, body_html, attachment_url: attachment_url || null,
    sender_id: req.user.id,
    status: status || 'sent',
    scheduled_at: scheduled_at || null,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
    recipients_count: recipients_count || 0,
    delivered_count: status === 'sent' ? (recipients_count || 0) : 0
  };
  messages.push(newMsg);
  write('messages', messages);

  // Auto-create message_recipients for parent/student users so they see it in their inbox
  if (newMsg.status === 'sent') {
    const users = read('users');
    const portalUsers = users.filter(u => u.role === 'parent' || u.role === 'student');
    const recipients = read('message_recipients');
    portalUsers.forEach(u => {
      recipients.push({
        id: nextId(recipients),
        message_id: newMsg.id,
        user_id: u.id,
        delivery_status: 'delivered',
        delivered_at: new Date().toISOString(),
        read_at: null,
        channel: 'inapp'
      });
    });
    write('message_recipients', recipients);
  }

  res.status(201).json(newMsg);
});

router.patch('/:id/resend', auth(['super_admin', 'staff']), (req, res) => {
  const messages = read('messages');
  const idx = messages.findIndex(m => m.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  messages[idx].status = 'sent';
  messages[idx].sent_at = new Date().toISOString();
  write('messages', messages);
  res.json(messages[idx]);
});

module.exports = router;
