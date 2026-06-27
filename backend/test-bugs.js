const axios = require('axios');

async function test() {
  const api = axios.create({ baseURL: 'http://localhost:3001' });
  try {
    // 1. Test AI route
    const aiRes = await api.post('/api/v1/ai/suggest', {
      subject: "Test",
      body: 123, // Send number to test text.replace crash
      type: "circular"
    });
    console.log("AI Route:", aiRes.status);
  } catch(e) { console.error("AI Bug:", e.response?.data || e.message); }

  try {
    // 2. Test messages route
    const msgRes = await api.get('/api/v1/messages');
    console.log("Messages Route:", msgRes.status);
  } catch(e) { console.error("Messages Bug:", e.response?.data || e.message); }

  try {
    // 3. Test portal route
    const portalRes = await api.get('/api/v1/portal/inbox');
    console.log("Portal Route:", portalRes.status);
  } catch(e) { console.error("Portal Bug:", e.response?.data || e.message); }

}
test();
