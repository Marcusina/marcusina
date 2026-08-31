import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string;
}

export function signAccessToken(userId: string): string {
  // Short-lived, per the security-hardening workflow this schema was
  // designed against - refresh handled by a separate endpoint, not a long
  // expiry here.
  return jwt.sign({ sub: userId } satisfies AccessTokenPayload, env.JWT_SECRET, { expiresIn: "1h" });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}
