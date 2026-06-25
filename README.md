# NexusComm - Automated School Communication Portal

NexusComm is a centralized, automated web prototype that streamlines communication workflows, applies rule-based logic to school data, tracks notification delivery states, and maintains parent-school interaction histories.

---

## 🚀 Quick Start (Windows)

To set up, test, and run the application in a single action:
1. Double-click the **`run.bat`** file in the root directory.
2. The script will automatically:
   - Install backend dependencies (`express`, `cors`, `body-parser`).
   - Run the programmatic full-stack integration tests.
   - Boot the Express application on **`http://localhost:3000`**.
3. Open your browser and navigate to **`http://localhost:3000`** to experience the premium interface.

---

## 📂 Project Architecture

```
/school-communication-portal
├── README.md                  # System overview and instruction manual
├── run.bat                    # Setup, testing, and startup batch script
├── /backend
│   ├── server.js              # Express API Server (GET /list, POST /create, GET /detail, exports)
│   ├── db.js                  # Stateful Relational JSON Database Engine
│   ├── package.json           # Backend dependency catalog
│   └── /data                  # Persistence layer (relational JSON files)
│       ├── students.json
│       ├── parents.json
│       ├── attendance.json
│       ├── grades.json
│       ├── fees.json
│       └── communications.json
├── /frontend
│   ├── index.html             # High-fidelity dashboard, forms, detail page SPA
│   ├── style.css              # Premium glassmorphism design system styling
│   └── app.js                 # API bindings, Chart.js updates, and Copilot text assistant
├── /tests
│   └── integration.test.js    # Programmatic integration testing script
└── /docs
    ├── literature_survey.md   # Literature survey (3+ references)
    ├── database_erd.md        # Relational schema specification & ERD Mermaid diagram
    └── rule_logic.md          # Workflow rule triggering conditions
```

---

## 🛠️ Core Technology Stack
* **Frontend**: HTML5, Vanilla CSS3 (Custom Responsive Layouts, Glassmorphism, Theme-Switcher), Vanilla JavaScript (Router, Client State Controller), Chart.js (CDNs), FontAwesome (CDNs).
* **Backend**: Node.js Express (REST Router, Templating Engine, CSV Exporter, PDF Printer layout).
* **Database**: Portable, Stateful Relational JSON Database (Custom JS ORM that simulates constraints, seeding, and relational queries).

---

## 📑 API Routing Specs

| Method | Endpoint | Description |
|:---|:---|:---|
| **GET** | `/api/dashboard-stats` | Aggregates system metrics (student counts, delivery success rates, channels). |
| **GET** | `/api/students` | Lists all student records with calculated attendance averages and balances. |
| **GET** | `/api/list` | Returns communication logs filterable by type, status, or search query. |
| **GET** | `/api/detail/:id` | Deep-dives into a student's parents, attendance ledger, exam grades, and timeline. |
| **POST** | `/api/create` | Runs rule evaluations, compiles templates, and begins transmission queue. |
| **POST** | `/api/test-message` | Triggers immediate manual parental alert. |
| **POST** | `/api/ai-assist` | Evaluates prompts against student databases to draft polished copy. |
| **GET** | `/api/export/csv` | Streams entire transmission history log as a CSV download. |
| **GET** | `/api/export/pdf/:id` | Renders a clean, print-friendly report card and communication audit sheet. |

---

## 💡 Automated Pipelines & Rules
1. **Attendance Flag**: Triggered when a student's attendance records drop below $75\%$. Sends a warning notification to the parent.
2. **Fee Arrears Flag**: Triggered when a student has an unpaid fees balance exceeding $\$500$. Queues a WhatsApp reminder.
3. **Copilot Helper**: Translates quick notes (e.g. "remind parent to bring physical report slip") into formal school announcements pre-populated with guardian details.
