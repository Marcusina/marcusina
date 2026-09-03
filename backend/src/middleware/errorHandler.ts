import type { NextFunction, Request, Response } from "express";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  console.error("[error]", err);
  // Read by requestScopedDb's 'finish' handler to roll back instead of
  // commit - this is the one place that flag gets set. See the comment in
  // requestScopedDb.ts for why it's not derived from the status code.
  req.dbRollbackRequested = true;
  if (res.headersSent) return;

  // Only typed domain errors reach here with a message safe to show a
  // caller - anything else (e.g. an unhandled pg error) can embed table/
  // constraint/column names in err.message, so it's shown only outside
  // production, same as every debug_* field elsewhere in this API.
  const message =
    process.env.NODE_ENV !== "production" && err instanceof Error ? err.message : "An unexpected error occurred";
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message } });
}
