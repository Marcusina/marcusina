import { afterEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { errorHandler } from "./errorHandler";

function mockRes() {
  const res = {
    statusCode: 0,
    headersSent: false,
    body: undefined as unknown,
  };
  const status = vi.fn((code: number) => {
    res.statusCode = code;
    return res as unknown as Response;
  });
  const json = vi.fn((body: unknown) => {
    res.body = body;
    return res as unknown as Response;
  });
  return Object.assign(res, { status, json }) as unknown as Response & typeof res;
}

describe("errorHandler", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("hides the real error message in production, so pg/internal details never reach a client", () => {
    process.env.NODE_ENV = "production";
    const req = {} as Request;
    const res = mockRes();

    errorHandler(new Error('duplicate key value violates unique constraint "users_email_key"'), req, res, vi.fn());

    expect(res.statusCode).toBe(500);
    expect((res.body as any).error).toEqual({
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    });
    // requestScopedDb reads this to decide rollback vs commit.
    expect((req as any).dbRollbackRequested).toBe(true);
  });

  it("shows the real error message outside production, for local debugging", () => {
    process.env.NODE_ENV = "development";
    const req = {} as Request;
    const res = mockRes();

    errorHandler(new Error("boom"), req, res, vi.fn());

    expect((res.body as any).error.message).toBe("boom");
  });

  it("does nothing once headers are already sent", () => {
    process.env.NODE_ENV = "development";
    const req = {} as Request;
    const res = mockRes();
    res.headersSent = true;

    errorHandler(new Error("boom"), req, res, vi.fn());

    expect(res.status).not.toHaveBeenCalled();
  });
});
