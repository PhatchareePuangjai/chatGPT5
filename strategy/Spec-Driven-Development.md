# Spec-Driven Development — Initial Prompts (Codex CLI)

> Note for IS re-run: ระบุ tech stack เป็น **Node.js + React + PostgreSQL**
> ให้ตรงกับ BP และ CE เพื่อควบคุมตัวแปร tech stack ไม่ให้กระทบผลเปรียบเทียบ
> (ในเปเปอร์ SDD ใช้ Python + FastAPI ซึ่งทำให้ CodeQL results เทียบกันได้ยาก)

---

### Stage 1 — Constitution

```
/speckit.constitution Create principles focused on code quality,
testing standards, user experience consistency,
and performance requirements
Stack: Node.js + Express (backend), React ^18.3.1, PostgreSQL (database)
```

---

### Stage 2 — Scenario

สร้างไฟล์ `scenarios_inventory.md` ด้วยมือ ระบุ:

- 3 acceptance scenarios: deduct, alert (stock <= 5), restore
- 4 edge cases: race condition (5 concurrent), atomicity (rollback on failure), overselling, boundary-value
- Tech stack: Node.js (backend), React (frontend), PostgreSQL (database)

---

### Stage 3 — Spec

```
/speckit.specify "Create a specification based on the
requirements in scenarios_inventory.md"
```

---

### Stage 4 — Plan

```
/speckit.plan
```

---

### Stage 5 — Task

```
/speckit.tasks
```

---

### Stage 6 — Implement

```
/speckit.implement
```
