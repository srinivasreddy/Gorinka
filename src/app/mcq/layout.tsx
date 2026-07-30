import type { ReactNode } from "react";
import { McqSessionProvider } from "@/lib/McqSessionContext";

export default function McqLayout({ children }: { children: ReactNode }) {
  return <McqSessionProvider>{children}</McqSessionProvider>;
}
