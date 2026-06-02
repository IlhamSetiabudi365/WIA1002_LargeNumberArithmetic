"use client";

import { motion } from "framer-motion";

type DLLNodeProps = {
  value: string;
  active?: boolean;
  processed?: boolean;
  decimal?: boolean;
};

export function DLLNode({ value, active = false, processed = false, decimal = false }: DLLNodeProps) {
  const baseClass =
    "relative flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-lg font-semibold shadow-lg";
  const stateClass = decimal
    ? "border-violet-300/50 bg-violet-950/80 text-violet-100"
    : active
      ? "border-violet-300 bg-[#1b1530] text-violet-50"
      : processed
        ? "border-violet-500/30 bg-violet-950/35 text-violet-100"
        : "border-slate-600/40 bg-[#172033] text-slate-100";

  return (
    <motion.div
      className={`${baseClass} ${stateClass}`}
      animate={{
        boxShadow: active
          ? "0 0 0 1px rgba(167,139,250,0.8), 0 0 28px rgba(139,92,246,0.46), 0 18px 36px rgba(0,0,0,0.32)"
          : "0 12px 28px rgba(0,0,0,0.26)"
      }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-white/10" />
      <span className="relative z-10">{value}</span>
    </motion.div>
  );
}
