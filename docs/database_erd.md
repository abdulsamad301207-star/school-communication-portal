# Relational Database Schema & Entity-Relationship Diagram (ERD)

This document outlines the relational database structure designed to support student record tracking, academic performance indicators, financial transactions, and multi-channel notifications.

---

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    PARENT ||--o{ STUDENT : "sponsors (1:N)"
    STUDENT ||--o{ ATTENDANCE : "records (1:N)"
    STUDENT ||--|| FEES : "assesses (1:1)"
    STUDENT ||--o{ GRADES : "registers (1:N)"
    STUDENT ||--o{ COMMUNICATIONS : "receives (1:N)"

    PARENT {
        varchar id PK "Primary Key (e.g. p1)"
        varchar name "Full Name"
        varchar email "Primary Email Address"
        varchar phone "Mobile Contact Number"
        varchar relation "Father / Mother / Guardian"
    }

    STUDENT {
        varchar id PK "Primary Key (e.g. s1)"
        varchar name "Full Name"
        varchar roll_number "Unique Registration Roll"
        varchar class "Academic Grade Division"
        varchar parent_id FK "References Parent.id"
    }

    ATTENDANCE {
        varchar student_id FK "References Student.id"
        date date "Attendance Check Date"
        varchar status "Present / Absent"
    }

    FEES {
        varchar student_id PK, FK "References Student.id"
        int total_due "Assessed Term Fee"
        int paid "Total Settled Amount"
        int balance "Outstanding Dues"
        date due_date "Payment Deadline"
    }

    GRADES {
        varchar student_id FK "References Student.id"
        varchar subject "Course Subject Name"
        int marks "Numerical Score (0-100)"
        varchar grade "Assigned Letter Grade"
    }

    COMMUNICATIONS {
        varchar id PK "Primary Key (e.g. c_123)"
        varchar student_id FK "References Student.id"
        varchar type "Attendance / Fee / Exam / Event / Custom"
        varchar priority "High / Medium / Low"
        varchar channel "Email / WhatsApp"
        varchar template "Template Name"
        text message "Compiled Notification Body"
        varchar status "Draft / Processing / Sent / Delivered / Failed"
        timestamp sent_at "Log Generation Timestamp"
    }
```

---

## 2. Integrity & Validation Rules

To prevent data corruption, the system applies the following client-side and server-side validation models before inserting database updates:

1. **Email Integrity**: Matches regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
2. **Phone Number Format**: Must include country code prefixes (e.g. `+91` or `+1`) to ensure Twilio or message API compatibility.
3. **Attendance Status Domain**: Restricted strictly to standard enum options: `['Present', 'Absent']`.
4. **Grading Boundary**: Scores in `GRADES` must range within the interval `[0, 100]`.
5. **Fee Balance Constraint**: Always verified programmatically as `balance = total_due - paid`.
6. **Communication Pipeline Bounds**: Status fields must transition logically:
   $$\text{Draft} \longrightarrow \text{Processing} \longrightarrow \text{Sent} \longrightarrow [\text{Delivered} \mid \text{Failed}]$$
