/* ==========================================================================
   NexusComm SPA Logic & API Binding
   ========================================================================== */

const API_BASE = '/api';
let studentsList = [];
let channelChartInstance = null;
let statusChartInstance = null;
let queuePollingInterval = null;

// DOM Elements
const views = {
  dashboard: document.getElementById('view-dashboard'),
  dispatch: document.getElementById('view-dispatch'),
  queue: document.getElementById('view-queue'),
  directory: document.getElementById('view-directory'),
  detail: document.getElementById('view-detail')
};

let currentUserSession = null;

// Start Up — no login required, boot directly as admin
function initApp() {
  fetchStudents().then(() => {
    setupNavigation();
    setupThemeToggle();
    setupFormHandlers();
    setupAIHelper();
    bootAdminSession();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function bootAdminSession() {
  currentUserSession = { role: 'admin', name: 'Abdul Latif', subName: 'Operations Lead', avatarSeed: 'Admin' };
  // Populate sidebar user details
  document.querySelector('.user-name').textContent = currentUserSession.name;
  document.querySelector('.user-role').textContent = currentUserSession.subName;
  document.querySelector('.avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUserSession.avatarSeed)}`;
  // Load the dashboard
  switchView('dashboard');
  document.querySelector('.menu-item[data-view="dashboard"]').classList.add('active');
  loadDashboardStats();
  loadAnomalies();
  startQueuePolling();
}





// ==========================================================================
// SPA Navigation & Routing
// ==========================================================================
function setupNavigation() {
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-view');
      switchView(targetView);
      
      // Update active menu link
      document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Quick dispatch floating action button
  const quickDispatchBtn = document.getElementById('quick-dispatch-btn');
  if (quickDispatchBtn) {
    quickDispatchBtn.addEventListener('click', () => {
      switchView('dispatch');
      document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      document.querySelector('[data-view="dispatch"]').classList.add('active');
    });
  }

  // Back to directory button in detail page
  document.getElementById('back-to-dir-btn').addEventListener('click', () => {
    switchView('directory');
  });

  // Modal dismiss
  document.getElementById('modal-close-btn').addEventListener('click', hideModal);
}

function switchView(viewName) {
  // Toggle views
  Object.keys(views).forEach(key => {
    if (key === viewName) {
      views[key].classList.add('active');
    } else {
      views[key].classList.remove('active');
    }
  });

  // Reset titles and triggers
  const title = document.getElementById('page-title');
  const subtitle = document.getElementById('page-subtitle');

  if (viewName === 'dashboard') {
    title.textContent = 'Operations Dashboard';
    subtitle.textContent = 'Real-time school operations and notification analytics.';
    loadDashboardStats();
    loadAnomalies();
  } else if (viewName === 'dispatch') {
    title.textContent = 'Dispatch Centre';
    subtitle.textContent = 'Formulate notification campaigns or review automated rule actions.';
    populateStudentSelector();
  } else if (viewName === 'queue') {
    title.textContent = 'Live Transmission Queue';
    subtitle.textContent = 'Review live notification statuses, network logs, and delivery receipts.';
    loadQueueLogs();
  } else if (viewName === 'directory') {
    title.textContent = 'Student Catalog';
    subtitle.textContent = 'Browse academic summary cards, parent info records, and audit profiles.';
    loadStudentDirectory();
  }
}

// ==========================================================================
// Light/Dark Theme Switcher
// ==========================================================================
function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const icon = toggleBtn.querySelector('i');
  
  toggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      icon.className = 'fa-solid fa-sun';
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      icon.className = 'fa-solid fa-moon';
    }
  });
}

// ==========================================================================
// API Handlers (Retrieve & Populate)
// ==========================================================================
async function fetchStudents() {
  try {
    const res = await fetch(`${API_BASE}/students`);
    studentsList = await res.json();
  } catch (err) {
    console.error('Error fetching student list:', err);
  }
}

function populateStudentSelector() {
  const select = document.getElementById('dispatch-student-select');
  select.innerHTML = '<option value="" disabled selected>Select student...</option>';
  
  studentsList.forEach(s => {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = `${s.name} (Roll ${s.roll_number}) - ${s.class}`;
    select.appendChild(option);
  });
}

// Dashboard Data Binding
async function loadDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/dashboard-stats`);
    const stats = await res.json();
    
    document.getElementById('kpi-students').textContent = stats.totalStudents;
    document.getElementById('kpi-dispatched').textContent = stats.messagesSent;
    document.getElementById('kpi-delivery-rate').textContent = `${stats.deliveryRate}%`;
    document.getElementById('kpi-flagged').textContent = stats.pendingActions;

    renderCharts(stats);
  } catch (err) {
    console.error('Error loading dashboard stats:', err);
  }
}

// Critical Anomalies Recommended List
function loadAnomalies() {
  const container = document.getElementById('dashboard-anomalies');
  container.innerHTML = '';
  
  const flaggedStudents = studentsList.filter(s => s.attendance_pct < 75 || s.fee_balance > 500);
  document.getElementById('recommendation-badge').textContent = `${flaggedStudents.length} Flagged`;
  
  if (flaggedStudents.length === 0) {
    container.innerHTML = `
      <div class="anomaly-item">
        <div class="anomaly-info">
          <span class="anomaly-student text-teal"><i class="fa-solid fa-circle-check"></i> System Cleared</span>
          <span class="anomaly-reason">No students currently flag low attendance or payment exceptions.</span>
        </div>
      </div>
    `;
    return;
  }

  flaggedStudents.forEach(s => {
    const item = document.createElement('div');
    item.className = 'anomaly-item';

    let reasonHTML = '';
    let btnHTML = '';
    
    if (s.attendance_pct < 75 && s.fee_balance > 500) {
      reasonHTML = `<span class="anomaly-reason text-error"><i class="fa-solid fa-triangle-exclamation"></i> Low Attendance (${s.attendance_pct}%) & High Fees Dues ($${s.fee_balance})</span>`;
      btnHTML = `<button class="action-btn secondary small-btn anomaly-act" data-student="${s.id}" data-template="Low Attendance Notice">Alert Parent</button>`;
    } else if (s.attendance_pct < 75) {
      reasonHTML = `<span class="anomaly-reason text-error"><i class="fa-solid fa-triangle-exclamation"></i> Low Attendance (${s.attendance_pct}%)</span>`;
      btnHTML = `<button class="action-btn secondary small-btn anomaly-act" data-student="${s.id}" data-template="Low Attendance Notice">Notify Attendance</button>`;
    } else {
      reasonHTML = `<span class="anomaly-reason text-warning"><i class="fa-solid fa-credit-card"></i> Outstanding Fees ($${s.fee_balance})</span>`;
      btnHTML = `<button class="action-btn secondary small-btn anomaly-act" data-student="${s.id}" data-template="Outstanding Fees Reminder">Send Balance Reminder</button>`;
    }

    item.innerHTML = `
      <div class="anomaly-info">
        <span class="anomaly-student">${s.name} (${s.class})</span>
        ${reasonHTML}
      </div>
      <div class="anomaly-actions">
        ${btnHTML}
      </div>
    `;

    // Hook quick trigger action click
    item.querySelector('.anomaly-act').addEventListener('click', (e) => {
      const studId = e.target.getAttribute('data-student');
      const tempName = e.target.getAttribute('data-template');
      triggerQuickCampaignConfig(studId, tempName);
    });

    container.appendChild(item);
  });
}

// Redirect quick-trigger config to Dispatch page
function triggerQuickCampaignConfig(studentId, templateName) {
  switchView('dispatch');
  document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
  document.querySelector('[data-view="dispatch"]').classList.add('active');
  
  // Set values in form
  document.getElementById('mode-single').checked = true;
  document.getElementById('group-single-selector').classList.remove('hidden');
  document.getElementById('group-rule-selector').classList.add('hidden');
  
  setTimeout(() => {
    document.getElementById('dispatch-student-select').value = studentId;
    document.getElementById('dispatch-template-select').value = templateName;
    document.getElementById('dispatch-template-select').dispatchEvent(new Event('change'));
  }, 100);
}

// Render Interactive Analytics (Chart.js)
function renderCharts(stats) {
  const channelCtx = document.getElementById('channelChart').getContext('2d');
  const statusCtx = document.getElementById('statusChart').getContext('2d');

  const isDark = document.body.classList.contains('dark-theme');
  const textClr = isDark ? '#94a3b8' : '#475569';
  const gridClr = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

  // Destroy past instances
  if (channelChartInstance) channelChartInstance.destroy();
  if (statusChartInstance) statusChartInstance.destroy();

  // Channel Doughnut
  channelChartInstance = new Chart(channelCtx, {
    type: 'doughnut',
    data: {
      labels: ['Email', 'WhatsApp'],
      datasets: [{
        data: [stats.channels.Email, stats.channels.WhatsApp],
        backgroundColor: ['#8b5cf6', '#14b8a6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textClr, font: { family: 'Plus Jakarta Sans' } }
        }
      }
    }
  });

  // Pipeline Status Bar Chart
  statusChartInstance = new Chart(statusCtx, {
    type: 'bar',
    data: {
      labels: ['Drafts', 'Processing', 'Sent', 'Delivered', 'Failed'],
      datasets: [{
        label: 'Message Count',
        data: [
          stats.statuses.Draft,
          stats.statuses.Processing,
          stats.statuses.Sent,
          stats.statuses.Delivered,
          stats.statuses.Failed
        ],
        backgroundColor: ['#64748b', '#f59e0b', '#3b82f6', '#10b981', '#f43f5e'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textClr }
        },
        y: {
          grid: { color: gridClr },
          ticks: { color: textClr, stepSize: 1 }
        }
      }
    }
  });
}

// ==========================================================================
// Form Submission & Campaign Logic
// ==========================================================================
function setupFormHandlers() {
  const modeRadios = document.querySelectorAll('[name="audience-mode"]');
  const groupSingle = document.getElementById('group-single-selector');
  const groupRule = document.getElementById('group-rule-selector');
  
  // Toggle between Single Student and Rule Triggers
  document.getElementById('mode-single').addEventListener('change', () => {
    groupSingle.classList.remove('hidden');
    groupRule.classList.add('hidden');
    document.getElementById('dispatch-student-select').required = true;
  });

  document.getElementById('mode-rule').addEventListener('change', () => {
    groupSingle.classList.add('hidden');
    groupRule.classList.remove('hidden');
    document.getElementById('dispatch-student-select').required = false;
  });

  // Template select custom textbox toggle
  const tempSelect = document.getElementById('dispatch-template-select');
  const customBox = document.getElementById('group-custom-body');
  
  tempSelect.addEventListener('change', () => {
    if (tempSelect.value === 'Custom / AI Assist') {
      customBox.classList.remove('hidden');
    } else {
      customBox.classList.add('hidden');
    }
  });

  // Main Campaign Submission
  const form = document.getElementById('dispatch-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const sendBtn = document.getElementById('send-workflow-btn');
    const origHTML = sendBtn.innerHTML;
    
    // Toggle Loader State
    sendBtn.disabled = true;
    sendBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Triggering Queue Processing...`;

    const isRuleMode = document.getElementById('mode-rule').checked;
    const channel = document.querySelector('input[name="dispatch-channel"]:checked').value;
    const templateName = tempSelect.value;
    const customText = document.getElementById('dispatch-custom-text').value;

    try {
      if (isRuleMode) {
        // Bulk Operational Rule processing
        const ruleVal = document.getElementById('dispatch-rule-select').value;
        let targets = [];

        if (ruleVal === 'attendance') {
          // Find students < 75%
          targets = studentsList.filter(s => s.attendance_pct < 75);
        } else if (ruleVal === 'fees') {
          // Find students fees > 500
          targets = studentsList.filter(s => s.fee_balance > 500);
        }

        if (targets.length === 0) {
          alert('No students found matching this criteria.');
          sendBtn.disabled = false;
          sendBtn.innerHTML = origHTML;
          return;
        }

        // Loop post targets to bulk pipeline
        let dispatchedCount = 0;
        for (const student of targets) {
          // Auto configure templates matching rule
          const resolvedTemplate = ruleVal === 'attendance' ? 'Low Attendance Notice' : 'Outstanding Fees Reminder';
          await fetch(`${API_BASE}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: student.id,
              template: resolvedTemplate,
              channel: channel
            })
          });
          dispatchedCount++;
        }

        showModal('Rule Dispatched', `Rule successfully checked. Dispatched alerts to ${dispatchedCount} parents.`);
      } else {
        // Single Student notification
        const studentId = document.getElementById('dispatch-student-select').value;
        const res = await fetch(`${API_BASE}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            template: templateName,
            channel: channel,
            custom_message: customText
          })
        });

        const data = await res.json();
        if (data.success) {
          showModal('Pipeline Dispatched', `Notification generated and queued to parent. (ID: ${data.record.id})`);
        } else {
          alert('Failed to dispatch alert: ' + data.error);
        }
      }
      
      form.reset();
      customBox.classList.add('hidden');
      
    } catch (err) {
      console.error(err);
      alert('Network error communicating with server pipeline.');
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = origHTML;
      fetchStudents(); // Refresh data
    }
  });

  // Search queue filtering inputs
  document.getElementById('queue-search').addEventListener('input', loadQueueLogs);
  document.getElementById('queue-filter-status').addEventListener('change', loadQueueLogs);
  document.getElementById('queue-filter-type').addEventListener('change', loadQueueLogs);
  
  // CSV exporter link binding
  document.getElementById('export-csv-btn').addEventListener('click', () => {
    window.open(`${API_BASE}/export/csv`, '_blank');
  });
}

// ==========================================================================
// AI Assist Panel Actions
// ==========================================================================
function setupAIHelper() {
  const generateBtn = document.getElementById('ai-generate-btn');
  const aiOutput = document.getElementById('ai-output-container');
  const proposalText = document.getElementById('ai-proposal-text');
  
  generateBtn.addEventListener('click', async () => {
    const prompt = document.getElementById('ai-prompt-input').value;
    const studentId = document.getElementById('dispatch-student-select').value;

    if (!studentId) {
      alert('Please select a student in the campaign form first to generate draft details.');
      return;
    }
    if (!prompt) {
      alert('Please enter a short prompt first.');
      return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Reasoning...`;

    try {
      const res = await fetch(`${API_BASE}/ai-assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, student_id: studentId })
      });
      
      const data = await res.json();
      if (data.draft) {
        proposalText.textContent = data.draft;
        aiOutput.classList.remove('hidden');
      } else {
        alert('Failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Copilot failed to generate text.');
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `<i class="fa-solid fa-bolt"></i> Generate Draft`;
    }
  });

  // Copy proposal contents to editor
  document.getElementById('ai-copy-btn').addEventListener('click', () => {
    const customTextarea = document.getElementById('dispatch-custom-text');
    customTextarea.value = proposalText.textContent;
    
    // Switch select to custom template and trigger show
    document.getElementById('dispatch-template-select').value = 'Custom / AI Assist';
    document.getElementById('group-custom-body').classList.remove('hidden');
    
    alert('Draft copied to campaign editor. Please review before dispatch.');
  });
}

// ==========================================================================
// Live Queue Log Polling
// ==========================================================================
async function loadQueueLogs() {
  const search = document.getElementById('queue-search').value;
  const status = document.getElementById('queue-filter-status').value;
  const type = document.getElementById('queue-filter-type').value;

  try {
    const res = await fetch(`${API_BASE}/list?search=${encodeURIComponent(search)}&status=${status}&type=${type}`);
    const logs = await res.json();
    
    const tbody = document.getElementById('queue-table-body');
    tbody.innerHTML = '';

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No logs match current filters.</td></tr>';
      return;
    }

    logs.forEach(l => {
      const tr = document.createElement('tr');
      const timeFormatted = new Date(l.sent_at).toLocaleTimeString();
      const dateFormatted = new Date(l.sent_at).toLocaleDateString();
      
      const channelIcon = l.channel === 'WhatsApp' 
        ? `<span class="text-teal"><i class="fa-brands fa-whatsapp"></i> WhatsApp</span>` 
        : `<span><i class="fa-solid fa-envelope"></i> Email</span>`;
        
      const statusClass = l.status.toLowerCase();
      const priorityClass = l.priority === 'High' ? 'badge-error' : l.priority === 'Medium' ? 'badge-warning' : 'badge-info';

      tr.innerHTML = `
        <td style="font-size: 13px;"><strong>${timeFormatted}</strong><br><span style="font-size: 11px; color: var(--text-muted);">${dateFormatted}</span></td>
        <td><strong>${l.student_name}</strong><br><span style="font-size: 11px; color: var(--text-muted);">Roll ${l.roll_number}</span></td>
        <td>${l.class}</td>
        <td><span class="badge ${l.type === 'Attendance Alert' ? 'badge-error' : l.type === 'Fee Reminder' ? 'badge-warning' : 'badge-success'}">${l.type}</span></td>
        <td>${channelIcon}</td>
        <td><span class="badge ${priorityClass}">${l.priority}</span></td>
        <td><span class="status-pill ${statusClass}">${l.status}</span></td>
        <td style="font-size: 12px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${l.message}">${l.message}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error fetching logs:', err);
  }
}

// Enable live updating on Queue and dashboard stats
function startQueuePolling() {
  if (queuePollingInterval) clearInterval(queuePollingInterval);
  queuePollingInterval = setInterval(() => {
    // Check if queue view is active, update
    if (views.queue.classList.contains('active')) {
      loadQueueLogs();
    }
    // Update dashboard metrics and charts
    if (views.dashboard.classList.contains('active')) {
      loadDashboardStats();
    }
  }, 3000);
}

// ==========================================================================
// Student Catalog & Directory Views
// ==========================================================================
function loadStudentDirectory() {
  const tbody = document.getElementById('directory-table-body');
  tbody.innerHTML = '';

  studentsList.forEach(s => {
    const tr = document.createElement('tr');
    tr.className = 'clickable-row';
    
    const attendClass = s.attendance_pct < 75 ? 'text-error' : 'text-teal';
    const feeClass = s.fee_balance > 500 ? 'text-error' : 'text-secondary';
    
    tr.innerHTML = `
      <td>${s.roll_number}</td>
      <td><strong>${s.name}</strong></td>
      <td>${s.class}</td>
      <td>${s.parent ? s.parent.name : 'N/A'} (${s.parent ? s.parent.relation : 'Guardian'})</td>
      <td><span class="${attendClass} font-bold">${s.attendance_pct}%</span></td>
      <td><span class="${feeClass} font-bold">$${s.fee_balance}</span></td>
      <td style="text-align: center;"><button class="action-btn tertiary small-btn view-detail-btn" data-id="${s.id}">View Audit</button></td>
    `;

    // Click trigger row navigation
    tr.querySelector('.view-detail-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.target.getAttribute('data-id');
      loadStudentDetailPane(id);
    });
    
    tr.addEventListener('click', () => {
      loadStudentDetailPane(s.id);
    });

    tbody.appendChild(tr);
  });
}

// Fetch single student information & timeline logs
async function loadStudentDetailPane(studentId) {
  try {
    const res = await fetch(`${API_BASE}/detail/${studentId}`);
    if (res.status === 404) {
      alert('Record not found');
      return;
    }
    
    const detail = await res.json();
    switchView('detail');

    // Populate metadata
    document.getElementById('detail-student-name').textContent = detail.name;
    document.getElementById('detail-student-class').textContent = `Class: ${detail.class} | Roll Number: ${detail.roll_number}`;
    
    // Parent info
    const parent = detail.parent || {};
    document.getElementById('detail-parent-name').textContent = parent.name || 'N/A';
    document.getElementById('detail-parent-relation').textContent = parent.relation || 'N/A';
    document.getElementById('detail-parent-phone').textContent = parent.phone || 'N/A';
    document.getElementById('detail-parent-email').textContent = parent.email || 'N/A';

    // PDF auditor export link configuration
    document.getElementById('detail-pdf-btn').href = `${API_BASE}/export/pdf/${detail.id}`;

    // Grades box
    const gradesList = document.getElementById('detail-grades-list');
    gradesList.innerHTML = '';
    
    if (detail.grades.length === 0) {
      gradesList.innerHTML = '<p style="grid-column: span 3; font-size: 13px; color: var(--text-muted);">No academic grades available.</p>';
    } else {
      detail.grades.forEach(g => {
        const box = document.createElement('div');
        box.className = 'grade-box';
        box.innerHTML = `
          <div class="grade-subject" title="${g.subject}">${g.subject}</div>
          <div class="grade-score">${g.marks}</div>
          <div class="grade-letter">${g.grade}</div>
        `;
        gradesList.appendChild(box);
      });
    }

    // Financial balances
    const fees = detail.fees || { total_due: 0, paid: 0, balance: 0 };
    document.getElementById('detail-fee-total').textContent = `$${fees.total_due}`;
    document.getElementById('detail-fee-paid').textContent = `$${fees.paid}`;
    document.getElementById('detail-fee-balance').textContent = `$${fees.balance}`;

    // Timeline Logs
    const timeline = document.getElementById('detail-timeline-list');
    timeline.innerHTML = '';

    if (detail.communications.length === 0) {
      timeline.innerHTML = '<p style="font-size: 13px; color: var(--text-muted); padding: 12px 0;">No dispatch communications recorded yet for this student.</p>';
    } else {
      // Sort desc
      const sortedComms = detail.communications.sort((a,b) => new Date(b.sent_at) - new Date(a.sent_at));
      sortedComms.forEach(c => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        const dateFormatted = new Date(c.sent_at).toLocaleString();
        
        item.innerHTML = `
          <div class="timeline-header">
            <span class="timeline-title">${c.type}</span>
            <span class="timeline-time">${dateFormatted}</span>
          </div>
          <div class="timeline-desc">${c.message}</div>
          <div class="timeline-meta">
            <span><strong>Channel:</strong> ${c.channel}</span>
            <span><strong>Status:</strong> <span class="status-pill ${c.status.toLowerCase()}">${c.status}</span></span>
          </div>
        `;
        timeline.appendChild(item);
      });
    }

    // Set up quick send manual alert form for this student
    const quickForm = document.getElementById('detail-quick-form');
    // Clear old listeners by cloning
    const newForm = quickForm.cloneNode(true);
    quickForm.parentNode.replaceChild(newForm, quickForm);

    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const msgInput = document.getElementById('detail-quick-message');
      const channelSelect = document.getElementById('detail-quick-channel');
      const sendBtn = document.getElementById('detail-quick-send');
      
      const message = msgInput.value;
      const channel = channelSelect.value;

      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';

      try {
        const res = await fetch(`${API_BASE}/test-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            message: message,
            channel: channel
          })
        });

        const data = await res.json();
        if (data.success) {
          msgInput.value = '';
          alert('Quick notification triggered! Loading into timeline queue.');
          
          // Re-load detail view to show update
          loadStudentDetailPane(studentId);
          fetchStudents();
        } else {
          alert('Failed to send alert: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Network pipeline failure.');
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
      }
    });

  } catch (err) {
    console.error('Error fetching details:', err);
  }
}

// ==========================================================================
// Custom Popup Modals (Success Toast)
// ==========================================================================
function showModal(title, message) {
  const modal = document.getElementById('toast-modal');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-message').textContent = message;
  modal.classList.remove('hidden');
}

function hideModal() {
  const modal = document.getElementById('toast-modal');
  modal.classList.add('hidden');
}
