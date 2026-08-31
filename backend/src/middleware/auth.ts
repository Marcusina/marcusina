import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";

/**
 * Runs on every request, before routing has happened, so it can't know
 * whether the route it's about to hit even needs req.user. If the header is
 * present and verifies, req.user is set. If it's missing, malformed, or
 * fails verification, req.user is simply left unset and the request
 * continues - it does NOT hard-reject here.
 *
 * This used to hard-reject on any invalid Authorization header. That broke
 * PUT /user/account/deactivate: auth.api.js's deactivateAccount(token) sends
 * the same opaque, non-JWT confirmation token as BOTH the ?token= query
 * param AND the Authorization header - a route that authorizes purely via
 * the query-string token and never reads req.user at all. Hard-rejecting
 * meant that route (and any other route that happens to receive a
 * coincidental bad Authorization header, whether or not it needs auth at
 * all) 401'd before ever running. `requireAuth` below is what actually
 * enforces authentication on the routes that need it; a bad token there
 * still correctly ends up as 401 AUTH_REQUIRED - just via req.user being
 * unset, not via this middleware inspecting the token's validity itself.
 */
export function attachUserIfPresent(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return next();

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next();

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub };
  } catch {
    // Deliberately swallowed - see the function comment above.
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: { code: "AUTH_REQUIRED", message: "Authentication required" } });
  }
  next();
}
