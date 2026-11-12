import { getRun } from "@/lib/db";
import { subscribeRun, type RunEvent } from "@/lib/conductor";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const runId = Number(id);
  const run = getRun(runId);
  if (!run) return new Response("not found", { status: 404 });

  const encoder = new TextEncoder();
  let unsubscribe = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: RunEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };
      send({ type: "status", run });
      if (run.log) send({ type: "log", chunk: run.log });

      if (run.status !== "running") {
        controller.close();
        return;
      }

      unsubscribe = subscribeRun(runId, (ev) => {
        send(ev);
        if (ev.type === "status") controller.close();
      });

      request.signal.addEventListener("abort", () => {
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
