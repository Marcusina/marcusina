// api/professional.api.js
//
// Client contract for frontend.md module 25 (PRO), backed by
// Telemedicine-nodejs-backend/src/domains/professional/*. This is
// authorization-sensitive PHI (a professional's patient roster and chart
// data) - the backend enforces that a professional can only read/annotate
// a patient's chart if an actual appointment relationship exists between
// them (see professional.service.js's assertAuthorizedRelationship), not
// just a client-side hide. Callers should still show a clear empty/error
// state on failure rather than assuming success.
import apiClient from "./apiClient";

export const getMyPatients = async () => {
  return await apiClient("/professional/patients", { method: "GET" });
};

export const getPatientChart = async (patientId) => {
  return await apiClient(`/professional/patients/${patientId}/chart`, { method: "GET" });
};

export const getMyClinicalNotes = async () => {
  return await apiClient("/professional/clinical-notes", { method: "GET" });
};

export const createClinicalNote = async (payload) => {
  return await apiClient("/professional/clinical-notes", { method: "POST", body: payload });
};

export const getMyAnalytics = async () => {
  return await apiClient("/professional/analytics", { method: "GET" });
};
