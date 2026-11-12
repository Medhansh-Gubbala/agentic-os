import os from "os";
import path from "path";
import fs from "fs";
import assert from "node:assert";

const tmpDb = path.join(os.tmpdir(), `app-db-check-${Date.now()}.db`);
process.env.APP_DB_PATH = tmpDb;

async function main() {
  const {
    upsertWorkflow,
    getWorkflow,
    createRun,
    appendRunLog,
    updateRun,
    getRun,
    createThread,
    addMessage,
    listMessages,
    createProposal,
    resolveProposal,
    createBriefing,
    markBriefingRead,
    listBriefings,
    setSetting,
    getSetting,
  } = await import("../src/lib/db.ts");

  const w1 = upsertWorkflow({
    slug: "test-workflow",
    name: "Test Workflow",
    branch: "main",
    type: "manual",
    cadence: "on_demand",
    schedule_cron: null,
    scope: "",
    prompt: "do the thing",
    model: "claude-sonnet-5",
    allowed_tools: '["Read"]',
    cwd_mode: "vault",
    takes_venture: 0,
    requires: "[]",
    enabled: 1,
  });
  const w2 = upsertWorkflow({
    slug: "test-workflow",
    name: "Test Workflow Renamed",
    branch: "main",
    type: "manual",
    cadence: "on_demand",
    schedule_cron: null,
    scope: "",
    prompt: "do the thing",
    model: "claude-sonnet-5",
    allowed_tools: '["Read"]',
    cwd_mode: "vault",
    takes_venture: 0,
    requires: "[]",
    enabled: 1,
  });
  assert.strictEqual(w1.id, w2.id, "upsert should preserve id");
  assert.strictEqual(w2.name, "Test Workflow Renamed", "upsert should update name");
  assert.strictEqual(getWorkflow("test-workflow")?.name, "Test Workflow Renamed");

  const run = createRun({ workflow_id: w1.id, prompt: "run it" });
  appendRunLog(run.id, "line1\n");
  appendRunLog(run.id, "line2\n");
  updateRun(run.id, { status: "done", finished_at: new Date().toISOString(), exit_code: 0 });
  const finishedRun = getRun(run.id)!;
  assert.strictEqual(finishedRun.log, "line1\nline2\n", "log should accumulate");
  assert.strictEqual(finishedRun.status, "done");
  assert.strictEqual(finishedRun.exit_code, 0);

  const thread = createThread("CEO", null, "Test thread");
  addMessage(thread.id, "user", "hello");
  addMessage(thread.id, "agent", "hi back");
  const msgs = listMessages(thread.id);
  assert.strictEqual(msgs.length, 2, "should have 2 messages");
  assert.strictEqual(msgs[0].content, "hello");
  assert.strictEqual(msgs[1].content, "hi back");

  const { listProposals } = await import("../src/lib/db.ts");
  const proposal = createProposal({ kind: "linear_issue", payload: '{"title":"x"}' });
  assert.strictEqual(proposal.status, "pending");
  resolveProposal(proposal.id, "approved", "looks good");
  const resolved = listProposals("approved").find((p) => p.id === proposal.id)!;
  assert.strictEqual(resolved.status, "approved");
  assert.strictEqual(resolved.reason, "looks good");

  const briefing = createBriefing({ title: "Daily brief", content: "all good" });
  markBriefingRead(briefing.id);
  const briefings = listBriefings();
  const found = briefings.find((b) => b.id === briefing.id)!;
  assert.strictEqual(found.unread, 0, "briefing should be marked read");

  setSetting("theme", "dark");
  assert.strictEqual(getSetting("theme"), "dark");
  setSetting("theme", "light");
  assert.strictEqual(getSetting("theme"), "light", "setSetting should overwrite");

  console.log("DB CHECK PASSED");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    try {
      fs.unlinkSync(tmpDb);
      fs.unlinkSync(`${tmpDb}-wal`);
      fs.unlinkSync(`${tmpDb}-shm`);
    } catch {
      // best effort cleanup
    }
  });
