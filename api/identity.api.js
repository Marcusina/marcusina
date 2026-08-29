// api/identity.api.js
//
// Client contract for the identity-lifecycle actions in frontend.md module 3
// (ID-07, ID-09, ID-11, ID-12, ID-15, ID-17), backed by
// Telemedicine-nodejs-backend/src/domains/identity/*. Suspend/reissue are
// real, immediate actions (they flip User.accountStatus). Recover/replace-
// card/merge/device-transfer are real too, but land as a genuinely queued
// `IdentityRequest` row (status "pending") rather than completing
// automatically - none of those four are safely instant-automatable (see
// identity.service.js's own comment). Callers that need to distinguish a
// queued request from a fully completed one should check the response's
// `status` field rather than assuming any non-throwing call means "done" -
// see IdentityScreens.js's MergeDuplicateAccountsScreen/DeviceTransferScreen
// for the pattern.
import apiClient from "./apiClient";

export const recoverMedGramId = async (payload) => {
  return await apiClient("/identity/recover", { method: "POST", body: payload });
};

export const replaceIdentityCard = async (payload) => {
  return await apiClient("/identity/replace-card", { method: "POST", body: payload });
};

export const suspendIdentity = async (payload) => {
  return await apiClient("/identity/suspend", { method: "POST", body: payload });
};

export const reissueIdentity = async (payload) => {
  return await apiClient("/identity/reissue", { method: "POST", body: payload });
};

export const mergeDuplicateAccounts = async (payload) => {
  return await apiClient("/identity/merge", { method: "POST", body: payload });
};

export const transferDevice = async (payload) => {
  return await apiClient("/identity/device-transfer", { method: "POST", body: payload });
};

export const scanPatientId = async (payload) => {
  return await apiClient("/identity/scan", { method: "POST", body: payload });
};

export const getVerificationHistory = async () => {
  return await apiClient("/identity/verification-history", { method: "GET" });
};
