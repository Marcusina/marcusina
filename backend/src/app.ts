import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Router } from "express";
import { env } from "./config/env";
import { attachUserIfPresent } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { requestScopedDb } from "./middleware/requestScopedDb";
import appointmentsRoutes from "./modules/appointments/appointments.routes";
import authRoutes from "./modules/auth/auth.routes";
import cartRoutes from "./modules/cart/cart.routes";
import communityRoutes from "./modules/community/community.routes";
import consentRoutes from "./modules/consent/consent.routes";
import identityRoutes from "./modules/identity/identity.routes";
import insuranceRoutes from "./modules/insurance/insurance.routes";
import labsRoutes from "./modules/labs/labs.routes";
import medsRoutes from "./modules/meds/meds.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import professionalRoutes from "./modules/professional/professional.routes";
import profilesRoutes from "./modules/profiles/profiles.routes";
import sudoRoutes from "./modules/sudo/sudo.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";

export const app = express();

// Only matters for browser (Expo web) clients - React Native's fetch isn't
// subject to CORS. credentials: true is required because api/apiClient.js
// sends credentials: "include"; that combination rejects origin: "*", so
// CORS_ORIGINS must be an explicit allowlist.
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser());
// Order matters: attachUserIfPresent must run before requestScopedDb so
// req.user is set in time for set_config('app.current_user_id', ...).
app.use(attachUserIfPresent);
app.use(requestScopedDb);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// utils/config.js in the Expo frontend builds every API call as
// http://<host>:<port>/api/v1/<path> - this prefix isn't a style choice,
// it's required for the frontend to reach any of these routes at all.
// /health stays unprefixed (conventional for infra health checks, and
// nothing in the frontend calls it).
const apiRouter = Router();
apiRouter.use(authRoutes);
apiRouter.use(appointmentsRoutes);
apiRouter.use(cartRoutes);
apiRouter.use(communityRoutes);
apiRouter.use(consentRoutes);
apiRouter.use(identityRoutes);
apiRouter.use(insuranceRoutes);
apiRouter.use(labsRoutes);
apiRouter.use(medsRoutes);
apiRouter.use(notificationsRoutes);
apiRouter.use(professionalRoutes);
apiRouter.use(profilesRoutes);
apiRouter.use(sudoRoutes);
apiRouter.use(wishlistRoutes);
app.use("/api/v1", apiRouter);

app.use(errorHandler);
