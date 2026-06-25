const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { read, write, nextId } = require('../db');

router.get('/', auth(['super_admin', 'staff']), (req, res) => res.json(read('groups')));

router.post('/', auth(['super_admin', 'staff']), (req, res) => {
  const items = read('groups');
  const item = { id: nextId(items), ...req.body, member_count: 0 };
  items.push(item); write('groups', items); res.status(201).json(item);
});

module.exports = router;
