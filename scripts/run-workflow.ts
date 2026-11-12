// Usage: node scripts/run-workflow.ts <slug> [venture] ["input"]
import { syncSeed } from "../src/lib/registry.ts";
import { startRun, subscribeRun } from "../src/lib/conductor.ts";
import { getRun } from "../src/lib/db.ts";

async function main() {
  const [slug, venture, input] = process.argv.slice(2);
  if (!slug) {
    console.error("usage: node scripts/run-workflow.ts <slug> [venture] [\"input\"]");
    process.exit(1);
  }

  syncSeed();
  const { runId } = startRun({ workflowSlug: slug, kind: "workflow", venture, input });
  console.log(`run ${runId} started`);

  await new Promise<void>((resolve) => {
    const unsubscribe = subscribeRun(runId, (ev) => {
      if (ev.type === "log") {
        process.stdout.write(ev.chunk);
      } else if (ev.type === "status") {
        unsubscribe();
        resolve();
      }
    });
  });

  const run = getRun(runId)!;
  console.log("\n--- final run row (log omitted) ---");
  console.log(JSON.stringify({ ...run, log: `<${run.log.length} chars>` }, null, 2));
  process.exit(run.status === "done" ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
