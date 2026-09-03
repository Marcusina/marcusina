import { describe, expect, it } from "vitest";
import { signAccessToken, verifyAccessToken } from "./jwt";

describe("jwt", () => {
  it("round-trips a user id through sign/verify", () => {
    const token = signAccessToken("user-123");
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe("user-123");
  });

  it("rejects a tampered token", () => {
    const token = signAccessToken("user-123");
    expect(() => verifyAccessToken(`${token}tampered`)).toThrow();
  });
});
