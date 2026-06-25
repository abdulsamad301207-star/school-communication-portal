const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { read, write, nextId } = require('../db');

router.get('/', auth(['super_admin', 'staff']), (req, res) => res.json(read('templates')));

router.post('/', auth(['super_admin', 'staff']), (req, res) => {
  const items = read('templates');
  const item = { id: nextId(items), ...req.body, created_at: new Date().toISOString() };
  items.push(item); write('templates', items); res.status(201).json(item);
});

router.put('/:id', auth(['super_admin', 'staff']), (req, res) => {
  const items = read('templates');
  const idx = items.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  items[idx] = { ...items[idx], ...req.body };
  write('templates', items); res.json(items[idx]);
});

router.delete('/:id', auth(['super_admin', 'staff']), (req, res) => {
  let items = read('templates');
  items = items.filter(t => t.id !== parseInt(req.params.id));
  write('templates', items); res.json({ success: true });
});

module.exports = router;
