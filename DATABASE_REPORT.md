# DATABASE_REPORT.md — Teacher Portal V1.0 Data Model & Security Audit

## 1. Existing Database Schema
The existing production database consists of 4 primary tables:
1. `profiles`: Stores student profiles (`full_name`, `grade`, `school_name`, `user_id`).
2. `analyses`: Stores Learning MRI diagnostics (`student_id`, `score_obtained`, `analysis_data`, `user_id`).
3. `admins`: Allowed admin accounts for telemetry analytics.
4. `analytics_events`: Telemetry events (`event_type`, `device_type`, `user_id`).

---

## 2. TP-V1.0 Additive Data Model

The Teacher Portal extends the database via ONE additive migration (`20260729_tp_v1_0_foundation.sql`):

```text
auth.users
  ├── profiles (student)
  └── teacher_profiles
         ├── teacher_classes
         └── exams
                ├── exam_questions
                ├── exam_attempts ──> analyses (Learning MRI)
                └── analyses (via added exam_id column)
```

### Table Definitions & Foreign Key Relationships
1. **`schools`**: Organization registry (`id`, `name`, `code`, `city`, `state`, `country`).
2. **`teacher_profiles`**: Linked 1-to-1 with `auth.users(id)` via `user_id`, FK `school_id` to `schools(id)`.
3. **`teacher_classes`**: Multi-class assignment linked to `teacher_profiles(id)`.
4. **`exams`**: Teacher examinations linked to `auth.users(id)` and `schools(id)`. Contains `parsed_blueprint_json` and `parsed_paper_json`.
5. **`exam_questions`**: Structured question breakdown linked to `exams(id)`.
6. **`exam_attempts`**: Student submission attempts linking `exams(id)` and `auth.users(id)` to `analyses(id)`.
7. **`analyses`**: Enhanced with additive column `exam_id REFERENCES public.exams(id) ON DELETE SET NULL`.

---

## 3. Security & Row Level Security (RLS) Policies

All new tables explicitly enforce Row Level Security (RLS):
- **`teacher_profiles`**: Accessible and editable strictly by `auth.uid() = user_id`.
- **`teacher_classes`**: Restricted to the owner teacher via `teacher_profiles` subquery.
- **`exams`**:
  - Full management restricted to `auth.uid() = teacher_id`.
  - Read-only access for students ONLY when `status = 'PUBLISHED'` and student's `grade` matches `exams.class_level`.
- **`exam_questions`**: Accessible by owning teacher or by students matching published exam criteria.
- **`exam_attempts`**: Students can insert/select their own attempts; teachers can select attempts for exams they created.

---

## 4. Storage Bucket Security Requirements
- **Bucket**: `question-papers` (Private access).
- **Access Rule**: Only owning teachers can upload and download draft papers. Students can read published papers associated with their enrolled grade.
