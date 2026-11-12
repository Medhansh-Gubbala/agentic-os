import cron, { type ScheduledTask } from "node-cron";
import { listWorkflows } from "./db";
import { startRun } from "./conductor";
import { syncSeed } from "./registry";

// ponytail: module-singleton guard on globalThis — dev hot-reload can re-run
// register() without a fresh process, which would otherwise double-schedule.
const g = globalThis as unknown as {
  __schedulerStarted?: boolean;
  __scheduledTasks?: Map<string, ScheduledTask>;
};

const tasks: Map<string, ScheduledTask> = g.__scheduledTasks ?? new Map();
g.__scheduledTasks = tasks;

function scheduleWorkflows(): void {
  for (const task of tasks.values()) task.destroy();
  tasks.clear();

  for (const wf of listWorkflows()) {
    if (!wf.enabled || wf.cadence !== "scheduled") continue;
    if (!wf.schedule_cron || !cron.validate(wf.schedule_cron)) {
      console.error(`scheduler: skipping ${wf.slug} — invalid schedule_cron: ${wf.schedule_cron}`);
      continue;
    }

    // node-cron 4.x (bundled): an options object with `timezone: undefined`
    // silently never fires — omit options entirely unless TZ is set.
    const job = () => {
      try {
        startRun({ workflowSlug: wf.slug, kind: "workflow" });
      } catch (err) {
        console.error(`scheduler: ${wf.slug} failed to start:`, err instanceof Error ? err.message : err);
      }
    };
    const task = process.env.TZ
      ? cron.schedule(wf.schedule_cron, job, { timezone: process.env.TZ })
      : cron.schedule(wf.schedule_cron, job);
    tasks.set(wf.slug, task);
  }
}

/** Re-read the registry and reschedule. Call after workflow edits. */
export function resyncSchedules(): void {
  scheduleWorkflows();
}

export function startScheduler(): void {
  if (g.__schedulerStarted) return;
  g.__schedulerStarted = true;

  syncSeed();
  scheduleWorkflows();
  console.log(`scheduler: started — ${tasks.size} scheduled: ${[...tasks.keys()].join(", ")}`);

  // ponytail: 5-min safety net so edits made via routes other than the
  // workflow editor still get picked up; per-edit callers should still call
  // resyncSchedules() directly for immediate effect.
  setInterval(resyncSchedules, 5 * 60 * 1000);
}
