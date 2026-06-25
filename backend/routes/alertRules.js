const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { read, write } = require('../db');

router.get('/', auth(['super_admin', 'staff']), (req, res) => res.json(read('alert_rules')));

router.put('/', auth(['super_admin', 'staff']), (req, res) => {
  write('alert_rules', req.body);
  res.json({ success: true });
});

module.exports = router;
