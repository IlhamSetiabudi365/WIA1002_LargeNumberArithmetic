"use client";

import type { DLLNode as DLLNodeType } from "@/lib/arithmetic";
import { DLLNode } from "@/components/DLLNode";

/**
 * Draws the two-way pointer between neighboring DLL nodes.
 */
function Connector() {
  return (
    <span className="relative h-4 w-8 shrink-0">
      <span className="absolute left-1 right-1 top-1/2 h-px -translate-y-1/2 bg-violet-300/45" />
      <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-violet-300/60" />
      <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r border-t border-violet-300/60" />
    </span>
  );
}

/**
 * Labels the start and end of the linked list.
 */
function EndCap({ label }: { label: string }) {
  return (
    <div className="mb-0.5 flex h-8 items-center rounded-full border border-slate-600/45 bg-[#0b1020] px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
      {label}
    </div>
  );
}

type DLLDiagramProps = {
  nodes?: DLLNodeType[];
  value?: string;
  label?: string;
  activeIndices?: number[];
  processedIndices?: number[];
  showEnds?: boolean;
  compact?: boolean;
  alignTail?: boolean;
};

/**
 * Renders either a list of DLL nodes or a display string as a linked-list diagram.
 *
 * The value prop is used for final answers that may include a decimal point.
 * The nodes prop is used for real digit-node arrays from the arithmetic steps.
 */
export function DLLDiagram({
  nodes,
  value,
  label,
  activeIndices = [],
  processedIndices = [],
  showEnds = true,
  compact = false,
  alignTail = false
}: DLLDiagramProps) {
  const chars = value
    ? value.split("").map((char, index) => ({ value: char, key: `${char}-${index}`, decimal: char === "." }))
    : (nodes ?? []).map((node, index) => ({ value: String(node.digit), key: node.id, decimal: false, index }));

  if (chars.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        {label ? `${label}: ` : ""}
        empty
      </div>
    );
  }

  return (
    <div className={compact ? "w-max min-w-full" : "w-max min-w-full space-y-2"}>
      {label ? <div className="text-sm font-semibold text-slate-300">{label}</div> : null}
      <div className={`flex min-w-full ${alignTail ? "justify-end" : "justify-start"}`}>
        <div className="flex w-max items-center gap-2">
          {showEnds ? (
            <EndCap label="Head" />
          ) : null}
          <div className="flex items-center gap-2">
            {chars.map((char, index) => {
              const active = activeIndices.includes(index);
              const processed = processedIndices.includes(index);

              return (
                <div className="flex items-center gap-2" key={char.key}>
                  <DLLNode value={char.value} active={active} processed={processed} decimal={char.decimal} />
                  {index < chars.length - 1 ? <Connector /> : null}
                </div>
              );
            })}
          </div>
          {showEnds ? (
            <EndCap label="Tail" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
