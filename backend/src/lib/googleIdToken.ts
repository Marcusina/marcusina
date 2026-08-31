import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";

export class GoogleAuthNotConfiguredError extends Error {
  constructor() {
    super("Google sign-in is not configured on this server");
  }
}

export class InvalidGoogleTokenError extends Error {
  constructor() {
    super("Google ID token failed verification");
  }
}

export interface GoogleProfile {
  email: string;
  googleId: string;
  emailVerified: boolean;
}

let client: OAuth2Client | null = null;
function getClient(): OAuth2Client {
  if (!env.GOOGLE_CLIENT_ID) throw new GoogleAuthNotConfiguredError();
  if (!client) client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  return client;
}

/**
 * Verifies signature, issuer, audience (must match GOOGLE_CLIENT_ID), and
 * expiry via Google's own library - the payload is never trusted without
 * this. This is the one piece of the Google login flow that genuinely
 * cannot be exercised in an automated test without a token actually signed
 * by Google; everything downstream of it (googleAuth.service.ts) takes a
 * plain GoogleProfile object instead, specifically so that logic CAN be
 * tested without a real token.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const oauthClient = getClient();

  let payload;
  try {
    const ticket = await oauthClient.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID! });
    payload = ticket.getPayload();
  } catch {
    throw new InvalidGoogleTokenError();
  }

  if (!payload?.email || !payload.sub) throw new InvalidGoogleTokenError();

  return {
    email: payload.email,
    googleId: payload.sub,
    emailVerified: payload.email_verified ?? false,
  };
}
