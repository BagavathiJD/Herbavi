import { SqlQueryLog } from "../../admin/src/types.js";

let sqlLogsCache: SqlQueryLog[] = [];

export function getSqlLogs(): SqlQueryLog[] {
  return sqlLogsCache;
}

export function clearSqlLogs(): void {
  sqlLogsCache = [];
}

export function logSqlQuery(query: string, durationMs?: number): void {
  const calculatedDuration =
    durationMs ?? parseFloat((Math.random() * 2.5 + 0.4).toFixed(2));

  const newLog: SqlQueryLog = {
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    query,
    executedAt: new Date().toISOString(),
    durationMs: calculatedDuration,
    success: true,
  };

  sqlLogsCache = [newLog, ...sqlLogsCache].slice(0, 150);
}
