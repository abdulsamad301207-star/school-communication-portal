const cron = require('node-cron');
const { read, write, nextId } = require('../db');

// Run every day at 6 PM
cron.schedule('0 18 * * *', () => {
  console.log('[AlertScheduler] Running attendance alert check...');
  const rules = read('alert_rules').filter(r => r.is_active);
  const students = read('students');
  const attendance = read('attendance');
  const messages = read('messages');
  const recipients = read('message_recipients');
  const users = read('users');

  students.forEach(student => {
    const records = attendance.filter(a => a.student_id === student.id);
    const total = records.length;
    if (total === 0) return;
    const present = records.filter(r => r.status === 'present').length;
    const pct = Math.round((present / total) * 100);

    rules.forEach(rule => {
      if (pct < rule.threshold_percent) {
        const parent = users.find(u => u.id === student.parent_id);
        if (!parent) return;
        // Check cooldown
        const cutoff = new Date(Date.now() - rule.cooldown_days * 86400000).toISOString();
        const recentAlert = messages.find(m => m.message_type === 'attendance' && m.sent_at > cutoff);
        if (recentAlert) return;
        // Create alert message
        const msgList = read('messages');
        const newMsg = {
          id: nextId(msgList),
          subject: `Attendance Alert — ${student.name} (${pct}%)`,
          message_type: 'attendance',
          body_html: `<p>Dear Parent, your child <strong>${student.name}</strong>'s attendance is <strong>${pct}%</strong>, below the ${rule.threshold_percent}% threshold.</p>`,
          sender_id: 1,
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          recipients_count: 1,
          delivered_count: 1
        };
        msgList.push(newMsg);
        write('messages', msgList);
        const rList = read('message_recipients');
        rList.push({ id: nextId(rList), message_id: newMsg.id, user_id: parent.id, delivery_status: 'delivered', delivered_at: new Date().toISOString(), read_at: null, channel: 'inapp' });
        write('message_recipients', rList);
        console.log(`[AlertScheduler] Alert sent for ${student.name} (${pct}%)`);
      }
    });
  });
});

console.log('[AlertScheduler] Scheduled — runs daily at 6 PM');
