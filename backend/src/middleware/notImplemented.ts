import type { Request, Response } from "express";

/**
 * Placeholder for a route that's wired into the routing table (matching the
 * exact path/method the frontend already calls in api/*.api.js) but not yet
 * implemented. Returns a structured 501 instead of Express's default 404, so
 * "not built yet" is distinguishable from "wrong URL" during integration.
 */
export function notImplemented(feature: string) {
  return (_req: Request, res: Response) => {
    res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: `${feature} is not implemented yet` } });
  };
}
