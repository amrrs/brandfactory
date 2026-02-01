import { useCallback, useState } from "react";

export interface DebugLogEntry {
  id: string;
  message: string;
  level: "info" | "error";
  timestamp: number;
}

export function useDebugLogs() {
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);

  const addLog = useCallback((message: string, level: DebugLogEntry["level"] = "info") => {
    setLogs((prev) => [
      {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        message,
        level,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return { logs, addLog, clearLogs };
}
