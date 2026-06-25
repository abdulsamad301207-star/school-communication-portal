require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/messages', require('./routes/messages'));
app.use('/api/v1/templates', require('./routes/templates'));
app.use('/api/v1/groups', require('./routes/groups'));
app.use('/api/v1/attendance', require('./routes/attendance'));
app.use('/api/v1/alert-rules', require('./routes/alertRules'));
app.use('/api/v1/ai', require('./routes/ai'));
app.use('/api/v1/portal', require('./routes/portal'));
app.use('/api/v1/reports', require('./routes/reports'));
app.use('/api/v1/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/v1/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Start scheduler
try { require('./services/alertScheduler'); } catch (e) { console.log('Scheduler note:', e.message); }

app.listen(PORT, () => console.log(`SGEI Backend running on http://localhost:${PORT}`));
