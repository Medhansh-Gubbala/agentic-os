import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-neutral-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => (
            <h1 className="font-display text-xl font-bold uppercase tracking-wider text-fg" {...p} />
          ),
          h2: (p) => (
            <h2 className="mt-5 font-display text-lg font-semibold uppercase tracking-wider text-fg" {...p} />
          ),
          h3: (p) => <h3 className="mt-4 font-display font-semibold text-fg" {...p} />,
          ul: (p) => <ul className="list-disc space-y-1 pl-5" {...p} />,
          ol: (p) => <ol className="list-decimal space-y-1 pl-5" {...p} />,
          a: (p) => <a className="text-cyan underline underline-offset-2" {...p} />,
          code: (p) => (
            <code className="rounded-sm bg-raised px-1 py-0.5 font-mono text-xs" {...p} />
          ),
          pre: (p) => (
            <pre className="overflow-x-auto rounded-lg border border-border bg-raised p-3 font-mono text-xs" {...p} />
          ),
          strong: (p) => <strong className="font-semibold text-fg" {...p} />,
          blockquote: (p) => (
            <blockquote className="border-l-2 border-border pl-3 text-dim" {...p} />
          ),
          table: (p) => <table className="w-full border-collapse text-xs" {...p} />,
          th: (p) => (
            <th className="border border-border bg-raised px-2 py-1 text-left font-mono" {...p} />
          ),
          td: (p) => <td className="border border-border px-2 py-1" {...p} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
