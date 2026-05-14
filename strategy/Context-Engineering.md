# Context Engineering — Initial Prompt

```
[Instruction & Role]
Act as an expert Full-stack Developer and System Architect.

[Tech Spec]
- Frontend: React ^18.3.1
- Backend: Node.js
- Database: PostgreSQL

[Business Scenarios]
- Successful Stock Deduction
- Low Stock Alert Trigger (stock <= 5)
- Stock Restoration

[Constraints]
- Handle Race Condition (5 concurrent requests)
- Ensure Transaction Atomicity (rollback on failure)
- Prevent Overselling

[Deliverables]
- Backend API with PostgreSQL integration
- Frontend dashboard
- Dockerfile and docker-compose.yml for full-stack deployment
- README.md with run instructions and verification steps for
  Low Stock Alert (<= 5) and Race Condition

[Self-Refinement Task]
After generating, review your output for correctness,
missing edge cases, and code quality before finalizing.
Bundle all generated code with a clear structure and
zip all code to me.
```
