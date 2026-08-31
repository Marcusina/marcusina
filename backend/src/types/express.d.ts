import type { PoolClient } from "pg";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      db?: PoolClient;
      /**
       * Set by errorHandler when an unexpected error reaches it. requestScopedDb
       * reads this to decide COMMIT vs ROLLBACK - see requestScopedDb.ts for why
       * this is NOT simply `res.statusCode < 400`.
       */
      dbRollbackRequested?: boolean;
    }
  }
}

export {};
