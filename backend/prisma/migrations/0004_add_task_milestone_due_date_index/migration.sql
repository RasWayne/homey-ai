-- Add composite index to accelerate transaction deadline lookups by milestone.
CREATE INDEX IF NOT EXISTS "tasks_milestone_id_due_date_idx"
ON "tasks" ("milestone_id", "due_date");
