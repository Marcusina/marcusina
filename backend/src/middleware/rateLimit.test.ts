import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loginRateLimiter } from "./rateLimit";

describe("loginRateLimiter", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.get("/probe", loginRateLimiter, (_req, res) => res.json({ ok: true }));
    await new Promise<void>((resolve) => {
      server = app.listen(0, resolve);
    });
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(() => {
    server.close();
  });

  it("allows requests under the limit, then blocks with 429 once exceeded", async () => {
    // limit is 15 per window (see rateLimit.ts) - the first 15 must succeed.
    for (let i = 0; i < 15; i++) {
      const res = await fetch(`${baseUrl}/probe`);
      expect(res.status).toBe(200);
    }
    const blocked = await fetch(`${baseUrl}/probe`);
    expect(blocked.status).toBe(429);
    const body = (await blocked.json()) as { error: { code: string } };
    expect(body.error.code).toBe("TOO_MANY_ATTEMPTS");
  });
});
