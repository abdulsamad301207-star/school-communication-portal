# System Logic and Notification Rule Specifications

This document outlines the operational rules engine that checks database states and automatically formats templates, priority weights, and dispatch modes.

---

## 1. Low Attendance Rule Check
* **Target Objective**: Automatically notify parents when a student's attendance records drop below academic compliance thresholds.
* **Trigger Condition**:
  $$Attendance\% = \left( \frac{\text{Present Count}}{\text{Total School Days}} \right) \times 100 < 75\%$$
* **System Action**:
  - **Category**: `Attendance Alert`
  - **Priority Rating**: `High`
  - **Auto Channel**: `Email` (Official administrative record)
  - **Template Header**: `Low Attendance Notice`
  - **Placeholder Interpolation**:
    ```text
    Dear {parent_name},

    This is to inform you that {student_name}'s attendance is currently {attendance_pct}%, which is below the minimum threshold of 75%. Prompt action and explanation are required. Please contact the class teacher.

    Regards,
    Campus Admin
    ```

---

## 2. Outstanding Fees Reminder Rule
* **Target Objective**: Automate collection tracking for school finance departments.
* **Trigger Condition**:
  $$\text{Outstanding Balance} = \text{Total Due} - \text{Total Paid} > \$500$$
* **System Action**:
  - **Category**: `Fee Reminder`
  - **Priority Rating**:
    - `High` if $\text{Current Date} > \text{Due Date}$
    - `Medium` if $\text{Current Date} \le \text{Due Date}$
  - **Auto Channel**: `WhatsApp` (High engagement / fast response)
  - **Template Header**: `Outstanding Fees Reminder`
  - **Placeholder Interpolation**:
    ```text
    Dear {parent_name},

    This is a friendly reminder that {student_name} has an outstanding fee balance of ${fee_balance}.00. The due date was {fee_due_date}. Please arrange for payment at your earliest convenience to avoid administrative holds.

    Regards,
    Accounts Department
    ```

---

## 3. Exam Performance Compilation
* **Target Objective**: Compile subject grades dynamically upon grading cycles and notify guardians.
* **Trigger Condition**:
  $$\text{New Exam Cycle Completed} = \text{True}$$
* **System Action**:
  - **Category**: `Exam Notice`
  - **Priority Rating**: `Medium`
  - **Auto Channel**: `Email`
  - **Template Header**: `Exam Grade Report`
  - **Dynamic Compiler Logic**: Loop through `GRADES` matching `student_id`, join as a string array: `Subject: Mark (Grade)`.
  - **Placeholder Interpolation**:
    ```text
    Dear {parent_name},

    Please find the latest examination grade summary for {student_name}:

    {grades_summary}

    Please review and encourage your ward's progress.

    Regards,
    Academic Principal
    ```
