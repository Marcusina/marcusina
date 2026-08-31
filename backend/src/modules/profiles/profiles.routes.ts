import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import {
  ProfileNotFoundError,
  UnsupportedRoleError,
  getGeneralProfile,
  getPatientProfile,
  getRoleSpecificProfile,
  normalizeRole,
  upsertGeneralProfile,
  upsertPatientProfile,
} from "./profiles.service";

const router = Router();

/**
 * ROUTE REGISTRATION ORDER MATTERS in this file and is not incidental.
 * Several path shapes here structurally overlap for the same HTTP method -
 * e.g. POST /profiles/patient/create matches BOTH the literal
 * /profiles/patient/create route AND the wildcard /profiles/:role/:userId
 * route (role="patient", userId="create"). Express resolves ties by
 * registration order, so every more-literal route below is registered
 * before the more-generic one it could be swallowed by. This was worked
 * out on paper, not guessed - see the comment above each block.
 */

const generalProfileSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  bio: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  preferred_language: z.string().default("en"),
  timezone: z.string().default("UTC"),
  location_address: z.string().nullable().optional(),
  location_country: z.string().nullable().optional(),
  location_state: z.string().nullable().optional(),
  location_city: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
});

function toGeneralProfileFields(data: z.infer<typeof generalProfileSchema>) {
  return {
    firstName: data.first_name,
    lastName: data.last_name,
    bio: data.bio ?? null,
    gender: data.gender ?? null,
    dateOfBirth: data.date_of_birth ?? null,
    preferredLanguage: data.preferred_language,
    timezone: data.timezone,
    locationAddress: data.location_address ?? null,
    locationCountry: data.location_country ?? null,
    locationState: data.location_state ?? null,
    locationCity: data.location_city ?? null,
    postalCode: data.postal_code ?? null,
  };
}

const patientProfileSchema = z.object({
  blood_group: z.string().nullable().optional(),
  height_cm: z.number().nullable().optional(),
  weight_kg: z.number().nullable().optional(),
  known_allergies: z.array(z.string()).nullable().optional(),
  chronic_conditions: z.array(z.string()).nullable().optional(),
});

function toPatientProfileFields(data: z.infer<typeof patientProfileSchema>) {
  return {
    bloodGroup: data.blood_group ?? null,
    heightCm: data.height_cm ?? null,
    weightKg: data.weight_kg ?? null,
    knownAllergies: data.known_allergies ?? null,
    chronicConditions: data.chronic_conditions ?? null,
  };
}

// --- Fully literal routes first ---

router.put("/profiles/update", requireAuth, async (req, res, next) => {
  const parsed = generalProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    res.json(await upsertGeneralProfile(req.db!, req.user!.id, toGeneralProfileFields(parsed.data)));
  } catch (err) {
    next(err);
  }
});

router.put("/profiles/create", requireAuth, async (req, res, next) => {
  const parsed = generalProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    res.status(201).json(await upsertGeneralProfile(req.db!, req.user!.id, toGeneralProfileFields(parsed.data)));
  } catch (err) {
    next(err);
  }
});

// user_id in the body must match the caller - createPatientProfile in
// auth.api.js sends { ...patientData, user_id: user._id }, but nothing
// authorizes creating a profile for anyone but yourself.
const createPatientProfileSchema = patientProfileSchema.extend({ user_id: z.string().uuid() });

router.post("/profiles/patient/create", requireAuth, async (req, res, next) => {
  const parsed = createPatientProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  if (parsed.data.user_id !== req.user!.id) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Cannot create a patient profile for another user" } });
  }
  try {
    res.status(201).json(await upsertPatientProfile(req.db!, req.user!.id, toPatientProfileFields(parsed.data)));
  } catch (err) {
    next(err);
  }
});

// --- Partially-wildcard routes next ---

router.get("/profiles/:userId/get", requireAuth, async (req, res, next) => {
  try {
    res.json(await getGeneralProfile(req.db!, req.params.userId));
  } catch (err) {
    if (err instanceof ProfileNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

// POST despite being a read - matches getPatientProfile's real method in
// auth.api.js exactly.
router.post("/profiles/patient/:userId", requireAuth, async (req, res, next) => {
  try {
    res.json(await getPatientProfile(req.db!, req.params.userId));
  } catch (err) {
    if (err instanceof ProfileNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

router.put("/profiles/patient/:userId", requireAuth, async (req, res, next) => {
  if (req.params.userId !== req.user!.id) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Cannot update another user's patient profile" } });
  }
  const parsed = patientProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    res.json(await upsertPatientProfile(req.db!, req.user!.id, toPatientProfileFields(parsed.data)));
  } catch (err) {
    next(err);
  }
});

function roleSpecificCreateHandler(defaultStatus: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const role = normalizeRole(req.params.role);
    try {
      if (role === "patient") {
        const parsed = patientProfileSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
        }
        return res.status(defaultStatus).json(await upsertPatientProfile(req.db!, req.user!.id, toPatientProfileFields(parsed.data)));
      }
      if (role === "professional" || role === "admin") {
        const parsed = generalProfileSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
        }
        return res.status(defaultStatus).json(await upsertGeneralProfile(req.db!, req.user!.id, toGeneralProfileFields(parsed.data)));
      }
      return res.status(400).json({ error: { code: "UNSUPPORTED_ROLE", message: `Unsupported role: ${req.params.role}` } });
    } catch (err) {
      next(err);
    }
  };
}

// PUT for role=admin, POST otherwise, per createRoleSpecificProfile's own
// method selection in auth.api.js.
router.put("/profiles/:role/create", requireAuth, roleSpecificCreateHandler(201));
router.post("/profiles/:role/create", requireAuth, roleSpecificCreateHandler(201));

// --- Fully generic route last ---

router.get("/profiles/:role/:userId", requireAuth, async (req, res, next) => {
  try {
    res.json(await getRoleSpecificProfile(req.db!, req.params.role, req.params.userId));
  } catch (err) {
    if (err instanceof ProfileNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    if (err instanceof UnsupportedRoleError) return res.status(400).json({ error: { code: "UNSUPPORTED_ROLE", message: err.message } });
    next(err);
  }
});

// method = normalizedRole === "patient" ? "POST" : "GET" in
// getRoleSpecificProfile - so POST only ever actually happens for role
// "patient" in practice, but the route is registered for any role for
// robustness (falls through to the same UnsupportedRoleError otherwise).
router.post("/profiles/:role/:userId", requireAuth, async (req, res, next) => {
  try {
    res.json(await getRoleSpecificProfile(req.db!, req.params.role, req.params.userId));
  } catch (err) {
    if (err instanceof ProfileNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    if (err instanceof UnsupportedRoleError) return res.status(400).json({ error: { code: "UNSUPPORTED_ROLE", message: err.message } });
    next(err);
  }
});

export default router;
