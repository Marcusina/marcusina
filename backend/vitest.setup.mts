// config/env.ts parses process.env at import time and process.exit(1)s if
// required vars are missing - so anything a test imports (even transitively,
// e.g. lib/jwt.ts -> config/env.ts) needs these set before that import runs.
// setupFiles run before any test file is loaded, which is what makes that
// safe here.
process.env.APP_DATABASE_URL ||= "postgres://test:test@localhost:5432/test";
process.env.JWT_SECRET ||= "test-only-secret-not-for-real-use";
process.env.NODE_ENV ||= "test";
