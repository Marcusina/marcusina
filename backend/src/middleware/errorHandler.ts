import type { NextFunction, Request, Response } from "express";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  console.error("[error]", err);
  // Read by requestScopedDb's 'finish' handler to roll back instead of
  // commit - this is the one place that flag gets set. See the comment in
  // requestScopedDb.ts for why it's not derived from the status code.
  req.dbRollbackRequested = true;
  if (res.headersSent) return;

  const message = err instanceof Error ? err.message : "Unexpected error";
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message } });
}
