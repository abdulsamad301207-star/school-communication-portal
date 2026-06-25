const router = require('express').Router();
const auth = require('../middleware/authMiddleware');

router.post('/suggest', auth(['super_admin', 'staff']), async (req, res) => {
  const { subject, body, type } = req.body;
  // If Anthropic key is set, call Claude; otherwise return a mock suggestion
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-3-5-sonnet-20241022', max_tokens: 512, messages: [{ role: 'user', content: `You are a school communication assistant for Sri Gowthami Educational Institutions. Improve the following ${type} message to be professional, clear, and parent-friendly. Return only the improved message text.\n\nSubject: ${subject}\n\nBody: ${body}` }] })
      });
      const data = await response.json();
      return res.json({ suggestion: data.content[0].text });
    } catch (e) { /* fall through to mock */ }
  }
  // Mock suggestion
  res.json({ suggestion: `Dear Parent,\n\nWe hope this message finds you well. ${body ? body.replace(/<[^>]+>/g, '') : 'Please find the following important notice regarding your child.'}\n\nThank you for your continued support and cooperation.\n\nWarm regards,\nSri Gowthami Educational Institutions\nMain Campus` });
});

module.exports = router;
