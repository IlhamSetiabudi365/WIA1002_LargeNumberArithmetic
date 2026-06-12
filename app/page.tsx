"use client";

import { useEffect, useReducer, useRef, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { DLLDiagram } from "@/components/DLLDiagram";
import {
  Operation,
  Step,
  nodesToString,
  parseDigits,
  runOperation,
  type ArithmeticRun,
  type DLLNode
} from "@/lib/arithmetic";

const operations: Array<{ id: Operation; label: string; name: string }> = [
  { id: "add", label: "+", name: "Addition" },
  { id: "subtract", label: "-", name: "Subtraction" },
  { id: "multiply", label: "*", name: "Multiplication" },
  { id: "divide", label: "/", name: "Division" }
];

const speedPresets = [
  { label: "Slow", value: 1400 },
  { label: "Normal", value: 900 },
  { label: "Fast", value: 350 }
];

// All interactive UI data is kept in one reducer so step navigation stays predictable.
type VisualizerState = {
  m: string;
  n: string;
  operation: Operation;
  run: ArithmeticRun;
  stepIndex: number;
  autoPlay: boolean;
  speed: number;
};

type VisualizerAction =
  | { type: "set-m"; value: string }
  | { type: "set-n"; value: string }
  | { type: "set-operation"; operation: Operation }
  | { type: "run" }
  | { type: "next" }
  | { type: "previous" }
  | { type: "toggle-auto" }
  | { type: "set-speed"; speed: number };

/**
 * Keeps input values numeric and falls back to 0 when the field is empty.
 */
function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "") || "0";
}

/**
 * Builds a fresh arithmetic run for the current input and selected operation.
 */
function createRun(m: string, n: string, operation: Operation) {
  return runOperation(sanitizeDigits(m), sanitizeDigits(n), operation);
}

/**
 * Handles all visualizer state transitions: input editing, operation changes,
 * manual step navigation, and autoplay.
 */
function reducer(state: VisualizerState, action: VisualizerAction): VisualizerState {
  if (action.type === "set-m") {
    return { ...state, m: sanitizeDigits(action.value), autoPlay: false };
  }

  if (action.type === "set-n") {
    return { ...state, n: sanitizeDigits(action.value), autoPlay: false };
  }

  if (action.type === "set-operation") {
    return { ...state, operation: action.operation, autoPlay: false };
  }

  if (action.type === "run") {
    return {
      ...state,
      run: createRun(state.m, state.n, state.operation),
      stepIndex: 0,
      autoPlay: false
    };
  }

  if (action.type === "next") {
    const lastIndex = Math.max(0, state.run.steps.length - 1);
    const nextIndex = Math.min(state.stepIndex + 1, lastIndex);

    return {
      ...state,
      stepIndex: nextIndex,
      autoPlay: nextIndex === lastIndex ? false : state.autoPlay
    };
  }

  if (action.type === "previous") {
    return {
      ...state,
      stepIndex: Math.max(0, state.stepIndex - 1),
      autoPlay: false
    };
  }

  if (action.type === "toggle-auto") {
    const atEnd = state.stepIndex >= state.run.steps.length - 1;
    return {
      ...state,
      stepIndex: atEnd ? 0 : state.stepIndex,
      autoPlay: !state.autoPlay
    };
  }

  if (action.type === "set-speed") {
    return { ...state, speed: action.speed };
  }

  return state;
}

/**
 * Marks nodes that have already been processed in the current right-to-left step.
 */
function processedIndices(nodes: DLLNode[], active: number[], stepIndex: number) {
  if (stepIndex === 0 || nodes.length === 0) {
    return [];
  }

  if (active.length === 0) {
    return nodes.map((_, index) => index);
  }

  const minActive = Math.min(...active);
  return nodes.map((_, index) => index).filter((index) => index > minActive && !active.includes(index));
}

/**
 * Shows the explanation and partial result for the current algorithm step.
 */
function StepDetails({ step }: { step: Step }) {
  const facts = [
    step.carry !== undefined ? `carry = ${step.carry}` : null,
    step.borrow !== undefined ? `borrow = ${step.borrow}` : null,
    step.digit !== undefined ? `digit = ${step.digit}` : null
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm leading-6 text-slate-200">{step.description}</p>
        {facts.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <span
                className="rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-100 shadow-sm shadow-slate-950/40"
                key={fact}
              >
                {fact}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200/80">
        <span className="h-px flex-1 bg-violet-300/20" />
        Partial result
        <span className="h-px flex-1 bg-violet-300/20" />
      </div>

      <div className="dll-scroll overflow-x-scroll rounded-2xl border border-slate-700/40 bg-[#0d1322]/80 p-3">
        <DLLDiagram nodes={step.partialResult} showEnds={step.partialResult.length > 0} compact alignTail />
      </div>

      {step.partialRows && step.partialRows.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Partial products</div>
          <div className="dll-scroll space-y-2 overflow-x-scroll rounded-2xl border border-slate-700/40 bg-[#0d1322]/80 p-3">
            {step.partialRows.map((row, index) => (
              <DLLDiagram nodes={row} label={`row ${index + 1}`} showEnds={false} compact alignTail key={`${nodesToString(row)}-${index}`} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Horizontally scrollable row used for a single linked-list memory view.
 */
function MemoryRow({
  children,
  label,
  railStyle,
  scrollKey
}: {
  children: ReactNode;
  label: string;
  railStyle: CSSProperties;
  scrollKey: string | number;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const row = rowRef.current;

    if (!row) {
      return;
    }

    requestAnimationFrame(() => {
      row.scrollLeft = row.scrollWidth;
    });
  }, [railStyle.minWidth, scrollKey]);

  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold text-slate-300">{label}</div>
      <div className="dll-scroll overflow-x-scroll pb-3" ref={rowRef}>
        <div style={railStyle}>{children}</div>
      </div>
    </div>
  );
}

/**
 * Keeps the input rows aligned to the tail so right-to-left arithmetic is easier to follow.
 */
function MemoryScrollGroup({
  children,
  railStyle,
  scrollKey
}: {
  children: ReactNode;
  railStyle: CSSProperties;
  scrollKey: string | number;
}) {
  const groupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    requestAnimationFrame(() => {
      group.scrollLeft = group.scrollWidth;
    });
  }, [railStyle.minWidth, scrollKey]);

  return (
    <div className="dll-scroll overflow-x-scroll pb-3" ref={groupRef}>
      <div className="space-y-7" style={railStyle}>
        {children}
      </div>
    </div>
  );
}

/**
 * Static wrapper for a labeled memory row.
 */
function MemoryStaticRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold text-slate-300">{label}</div>
      {children}
    </div>
  );
}

/**
 * Main page for the large-number arithmetic visualizer.
 */
export default function Home() {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const m = "1234";
    const n = "567";
    const operation: Operation = "add";

    return {
      m,
      n,
      operation,
      run: createRun(m, n, operation),
      stepIndex: 0,
      autoPlay: false,
      speed: 900
    };
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentStep = state.run.steps[state.stepIndex] ?? state.run.steps[0];
  const mNodes = currentStep?.aNodes ?? state.run.normalizedA ?? parseDigits(state.m, "display-m");
  const nNodes = currentStep?.bNodes ?? state.run.normalizedB ?? parseDigits(state.n, "display-n");
  const activeM = currentStep?.activeIndices.a ?? [];
  const activeN = currentStep?.activeIndices.b ?? [];
  const selectedOperation = operations.find((operation) => operation.id === state.operation);
  const isError = state.run.resultString.toLowerCase().includes("cannot divide");
  const memoryAnswerValue = currentStep?.partialResult.length
    ? currentStep.resultString ?? nodesToString(currentStep.partialResult)
    : "";
  const memorySlots = Math.max(
    mNodes.length,
    nNodes.length,
    memoryAnswerValue ? memoryAnswerValue.length : 0,
    1
  );
  const memoryRailStyle = { minWidth: `${memorySlots * 92 + 170}px` };

  // Autoplay advances the timeline at the selected speed and stops at the final step.
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (state.autoPlay) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: "next" });
      }, state.speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.autoPlay, state.speed]);

  return (
    <main className="min-h-screen px-4 py-5 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="border-b border-slate-700/30 pb-5">
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">DigiTrace</h1>
              <p className="mt-1 text-sm text-slate-400">Trace big integer operations through doubly linked list nodes.</p>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18rem_11rem] xl:items-end">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">m</span>
                <input
                  className="h-14 w-full rounded-xl border border-slate-700/50 bg-[#0f1626]/80 px-4 text-lg text-violet-50 outline-none transition placeholder:text-slate-600 focus:border-violet-400 focus:bg-[#111a2d] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.14)]"
                  inputMode="numeric"
                  value={state.m}
                  onChange={(event) => dispatch({ type: "set-m", value: event.target.value })}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">n</span>
                <input
                  className="h-14 w-full rounded-xl border border-slate-700/50 bg-[#0f1626]/80 px-4 text-lg text-violet-50 outline-none transition placeholder:text-slate-600 focus:border-violet-400 focus:bg-[#111a2d] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.14)]"
                  inputMode="numeric"
                  value={state.n}
                  onChange={(event) => dispatch({ type: "set-n", value: event.target.value })}
                />
              </label>

              <div className="flex h-14 min-w-0 overflow-hidden rounded-xl border border-slate-700/60 bg-[#0f1626]/80">
                {operations.map((operation) => (
                  <button
                    className={`h-full flex-1 border-r border-slate-700/60 text-lg font-bold transition last:border-r-0 ${
                      state.operation === operation.id
                        ? "bg-violet-500/15 text-violet-300 shadow-[inset_0_-2px_0_rgba(139,92,246,0.55)]"
                        : "text-slate-300 hover:bg-violet-500/10 hover:text-violet-100"
                    }`}
                    key={operation.id}
                    onClick={() => dispatch({ type: "set-operation", operation: operation.id })}
                    title={operation.name}
                    type="button"
                  >
                    {operation.label}
                  </button>
                ))}
              </div>

              <button
                className="group flex h-14 w-full items-center justify-center rounded-xl bg-violet-500 px-6 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(139,92,246,0.28)] transition hover:bg-violet-400 hover:shadow-[0_18px_44px_rgba(139,92,246,0.38)]"
                onClick={() => dispatch({ type: "run" })}
                type="button"
              >
                Run <span className="ml-2 inline-block transition group-hover:translate-x-0.5">-&gt;</span>
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-5 lg:flex-row">
          <section className="min-w-0 rounded-3xl border border-violet-300/20 bg-[#101827]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] lg:basis-[60%]">
            <div className="mb-8 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">DLL Memory View</h2>
                <p className="text-sm text-slate-400">{selectedOperation?.name} starts at the tail and walks backward.</p>
              </div>
              <span className="rounded-full border border-violet-300/25 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">
                step {state.stepIndex + 1}/{state.run.steps.length}
              </span>
            </div>

            <div className="space-y-7">
              <MemoryScrollGroup railStyle={memoryRailStyle} scrollKey={state.stepIndex}>
                <MemoryStaticRow label={`m = ${nodesToString(mNodes)}`}>
                  <DLLDiagram
                    nodes={mNodes}
                    activeIndices={activeM}
                    processedIndices={processedIndices(mNodes, activeM, state.stepIndex)}
                    alignTail
                  />
                </MemoryStaticRow>
                <MemoryStaticRow label={`n = ${nodesToString(nNodes)}`}>
                  <DLLDiagram
                    nodes={nNodes}
                    activeIndices={activeN}
                    processedIndices={processedIndices(nNodes, activeN, state.stepIndex)}
                    alignTail
                  />
                </MemoryStaticRow>
              </MemoryScrollGroup>
              {memoryAnswerValue ? (
                <motion.div
                  key={`memory-answer-${state.stepIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="rounded-2xl border border-slate-700/40 bg-slate-900/40 p-4"
                >
                  <MemoryRow label={`answer = ${memoryAnswerValue}`} railStyle={memoryRailStyle} scrollKey={state.stepIndex}>
                    <DLLDiagram value={memoryAnswerValue} alignTail />
                  </MemoryRow>
                </motion.div>
              ) : null}
            </div>
          </section>

          <section className="min-w-0 rounded-3xl border border-slate-700/45 bg-[#0d1322]/75 p-5 lg:basis-[40%]">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-white">Step Trace</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-xl border border-slate-700/60 bg-[#111827] px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/70 disabled:text-slate-600"
                  disabled={state.stepIndex === 0}
                  onClick={() => dispatch({ type: "previous" })}
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="rounded-xl bg-violet-500 px-3 py-2 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(139,92,246,0.24)] transition hover:bg-violet-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
                  disabled={state.stepIndex >= state.run.steps.length - 1}
                  onClick={() => dispatch({ type: "next" })}
                  type="button"
                >
                  Next Step
                </button>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between gap-3 border-y border-slate-700/35 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Playback</span>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex overflow-hidden rounded-xl border border-slate-700/60 bg-[#111827]">
                  {speedPresets.map((preset) => (
                    <button
                      className={`border-r border-slate-700/60 px-3 py-1.5 text-xs font-semibold last:border-r-0 ${
                        state.speed === preset.value
                          ? "bg-violet-500/15 text-violet-300 shadow-[inset_0_-2px_0_rgba(139,92,246,0.55)]"
                          : "text-slate-400 transition hover:bg-violet-500/10 hover:text-violet-100"
                      }`}
                      key={preset.label}
                      onClick={() => dispatch({ type: "set-speed", speed: preset.value })}
                      type="button"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <button
                  className={`rounded-xl border border-slate-700/60 px-3 py-1.5 text-xs font-semibold transition ${
                    state.autoPlay
                      ? "bg-violet-500/15 text-violet-300 shadow-[inset_0_-2px_0_rgba(139,92,246,0.55)]"
                      : "bg-[#111827] text-slate-400 hover:bg-violet-500/10 hover:text-violet-100"
                  }`}
                  onClick={() => dispatch({ type: "toggle-auto" })}
                  type="button"
                >
                  Auto Play
                </button>
              </div>
            </div>

            <div className="relative pl-9">
              <div className="absolute left-3 top-3 h-full w-px bg-violet-300/20" />
              <div className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border border-violet-300/45 bg-violet-500/20 text-xs font-semibold text-violet-100">
                {state.stepIndex + 1}
              </div>
              <motion.div
                key={state.stepIndex}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.26, ease: "easeOut" }}
                className="rounded-2xl border border-slate-700/45 bg-[#0b1020]/70 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.24)]"
              >
                {currentStep ? <StepDetails step={currentStep} /> : null}
              </motion.div>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-700/40 bg-[#101827]/70 px-5 py-6 shadow-[0_-18px_60px_rgba(0,0,0,0.22)]">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Result</h2>
            </div>
            <div className="text-sm text-slate-400">
              {state.m} {selectedOperation?.label} {state.n}
            </div>
          </div>

          {isError ? (
            <div className="rounded-2xl border border-red-400/35 bg-red-950/60 px-4 py-3 text-red-100">{state.run.resultString}</div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="dll-scroll overflow-x-scroll rounded-2xl border border-slate-700/40 bg-[#0b1020]/75 p-4">
                <DLLDiagram value={state.run.resultString} label="result DLL" alignTail />
              </div>
              <div className="min-w-0 rounded-2xl bg-violet-500/10 px-5 py-4 text-2xl font-semibold text-violet-100 shadow-[0_18px_46px_rgba(139,92,246,0.12)] sm:text-3xl">
                {state.run.resultString}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
