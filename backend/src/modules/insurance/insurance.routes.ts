import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { listInsuranceForPatientProfile } from "./insurance.repository";

const router = Router();

// No dedicated service layer - there's no business logic beyond the RLS-
// scoped read (same precedent as meds.routes.ts calling its repository
// directly). The frontend contract given has no create/update endpoint for
// insurance at all, so none is invented here.
router.get("/insurance/patient/:patientProfileId", requireAuth, async (req, res, next) => {
  try {
    res.json(await listInsuranceForPatientProfile(req.db!, req.params.patientProfileId));
  } catch (err) {
    next(err);
  }
});

export default router;
