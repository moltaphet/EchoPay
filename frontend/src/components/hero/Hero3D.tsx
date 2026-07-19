"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

const GlassFrameScene = dynamic(
  () => import("./GlassFrameScene").then((m) => m.GlassFrameScene),
  { ssr: false },
);

function LoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#020617]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-cyan-400/60">
        LOADING…
      </p>
    </div>
  );
}

export function Hero3D() {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <div className="absolute inset-0 z-0 h-full w-full overflow-hidden bg-[#020617]">
      <LoadingOverlay visible={!ready} />
      <div
        className="absolute inset-0 h-full w-full transition-opacity duration-500"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <GlassFrameScene onReady={onReady} className="h-full w-full" />
      </div>
    </div>
  );
}
