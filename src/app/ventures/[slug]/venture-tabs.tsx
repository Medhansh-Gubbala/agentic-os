"use client";

import { useState, type ReactNode } from "react";
import { Tabs, type TabItem } from "@/components/ds";

/** Client boundary for tab-switching state; panel bodies are pre-rendered server JSX. */
export function VentureTabs({ tabs, panels }: { tabs: TabItem[]; panels: Record<string, ReactNode> }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  return (
    <div>
      <Tabs tabs={tabs} value={active} onChange={setActive} style={{ marginBottom: 18 }} />
      {panels[active]}
    </div>
  );
}
