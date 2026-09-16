// TEMP DEMO MODE data. See utils/demoMode.js for the on/off switch. This
// file is the fake "backend" apiClient.js reads from/writes to while demo
// mode is on - in-memory only, resets on reload.
import { DEMO_USER_ID } from "./demoMode";

const hoursAgo = (n) => new Date(Date.now() - n * 3600000).toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const daysFromNow = (n) => new Date(Date.now() + n * 86400000).toISOString();

export const DEMO_USER = {
  _id: DEMO_USER_ID,
  email: "ava.thompson@medgram.app",
  username: "ava.thompson",
  phone_number: "+2348012345678",
  is_phone_verified: true,
  account_status: "active",
  role: { role_type: "patient" },
  profile: {
    first_name: "Ava",
    last_name: "Thompson",
    bio: "Marathon runner. Type 1 diabetic. Advocate for accessible healthcare.",
    location_address: "Lagos, Nigeria",
  },
};

const DEMO_PATIENT_PROFILE = {
  _id: "demo-patient-profile-001",
  blood_group: "O+",
  height_cm: 168,
  weight_kg: 61,
  known_allergies: ["Penicillin"],
  chronic_conditions: ["Type 1 Diabetes"],
};

const DEMO_MEDICATIONS = [
  { _id: "demo-med-1", medication_name: "Amoxicillin 500mg", generic_name: "Amoxicillin", drug_class: "Antibiotic", requires_prescription: true, image_url: [] },
  { _id: "demo-med-2", medication_name: "Paracetamol 500mg", generic_name: "Paracetamol", drug_class: "Analgesic", requires_prescription: false, image_url: [] },
  { _id: "demo-med-3", medication_name: "Vitamin D3 2000IU", generic_name: "Cholecalciferol", drug_class: "Vitamin", requires_prescription: false, image_url: [] },
  { _id: "demo-med-4", medication_name: "Omega-3 Fish Oil", generic_name: "Fish Oil", drug_class: "Vitamin", requires_prescription: false, image_url: [] },
  { _id: "demo-med-5", medication_name: "Metformin 500mg", generic_name: "Metformin", drug_class: "Antidiabetic", requires_prescription: true, image_url: [] },
  { _id: "demo-med-6", medication_name: "Ibuprofen 200mg", generic_name: "Ibuprofen", drug_class: "Analgesic", requires_prescription: false, image_url: [] },
  { _id: "demo-med-7", medication_name: "Children's First Aid Kit", generic_name: "First Aid Kit", drug_class: "First Aid", requires_prescription: false, image_url: [] },
  { _id: "demo-med-8", medication_name: "Baby Electrolyte Solution", generic_name: "Oral Rehydration Salts", drug_class: "Baby", requires_prescription: false, image_url: [] },
];

const findMedication = (id) => DEMO_MEDICATIONS.find((m) => m._id === id);

let demoCart = {
  items: [
    { _id: "demo-cart-1", quantity: 2, unit_price: 12.5, medication_id: findMedication("demo-med-1") },
    { _id: "demo-cart-2", quantity: 1, unit_price: 8.0, medication_id: findMedication("demo-med-2") },
  ],
};

let demoWishlist = {
  items: [
    { _id: "demo-wish-1", medication_id: findMedication("demo-med-3") },
    { _id: "demo-wish-2", medication_id: findMedication("demo-med-4") },
  ],
};

let demoNotifications = [
  {
    _id: "demo-notif-1",
    notification_type: "appointment_reminder",
    title: "Upcoming appointment",
    content: "Your video consultation with Dr. Chidi Eze is tomorrow at 10:30 AM.",
    is_read: false,
    created_at: hoursAgo(1),
  },
  {
    _id: "demo-notif-2",
    notification_type: "prescription_ready",
    title: "Prescription ready",
    content: "Your Amoxicillin prescription is ready for pickup.",
    is_read: false,
    created_at: hoursAgo(5),
  },
  {
    _id: "demo-notif-3",
    notification_type: "lab_result",
    title: "Lab results available",
    content: "Your recent blood panel results are ready to view.",
    is_read: true,
    created_at: daysAgo(1),
  },
];

let demoAppointments = [
  {
    _id: "demo-appt-1",
    status: "confirmed",
    appointment_type: "video",
    scheduled_start_time: daysFromNow(1),
    consultation_reason: "Routine diabetes check-up",
    provider_id: { username: "dr.chidi", profile: { first_name: "Chidi", last_name: "Eze" } },
  },
  {
    _id: "demo-appt-2",
    status: "completed",
    appointment_type: "in_person",
    scheduled_start_time: daysAgo(7),
    consultation_reason: "Annual physical",
    provider_id: { username: "dr.amara", profile: { first_name: "Amara", last_name: "Nwosu" } },
  },
];

const DEMO_PRESCRIPTIONS = [
  {
    _id: "demo-rx-1",
    prescription_number: "RX-10234",
    status: "sent_to_pharmacy",
    prescription_date: daysAgo(7),
    expires_at: daysFromNow(150),
    patient_instructions: "Take one tablet twice daily with food.",
  },
  {
    _id: "demo-rx-2",
    prescription_number: "RX-10198",
    status: "dispensed",
    prescription_date: daysAgo(30),
    expires_at: daysFromNow(120),
    patient_instructions: "Take as needed for pain, max 3 per day.",
  },
];

const DEMO_LAB_ORDERS = [
  { _id: "demo-lab-1", test_name: "Complete Blood Count", status: "completed", order_type: "Blood Test", ordered_at: daysAgo(14) },
  { _id: "demo-lab-2", test_name: "HbA1c Panel", status: "pending", order_type: "Blood Test", ordered_at: daysAgo(2) },
];

const DEMO_INSURANCE = [
  {
    _id: "demo-ins-1",
    insurance_provider_id: { provider_name: "AXA Mansard Health" },
    policy_number: "AXA-88213",
    is_primary: true,
    policy_end_date: daysFromNow(240),
  },
];

const DEMO_ORGANIZATIONS = [
  { _id: "demo-org-1", name: "Lagos University Teaching Hospital", org_type: "clinic" },
  { _id: "demo-org-2", name: "AXA Mansard Health", org_type: "insurer" },
];

let demoCommunitiesMine = [
  { _id: "demo-comm-1", community_name: "Diabetes Support Network", member_count: 8420, post_count: 132 },
  { _id: "demo-comm-2", community_name: "Runners Health Circle", member_count: 3190, post_count: 54 },
];

const DEMO_ALL_COMMUNITIES = [
  { _id: "demo-comm-3", community_name: "Hypertension Warriors NG", member_count: 14200, post_count: 340 },
  { _id: "demo-comm-4", community_name: "Mental Health Support Alliance", member_count: 22100, post_count: 610 },
  { _id: "demo-comm-5", community_name: "Sickle Cell Warriors", member_count: 5600, post_count: 88 },
];

/**
 * Returns a canned response for a mocked endpoint, or undefined if nothing
 * specific is defined - callers fall back to a generic default in that case.
 */
export function getDemoResponse(endpoint, method = "GET", body) {
  const path = endpoint.split("?")[0];
  const m = (method || "GET").toUpperCase();

  if (path === "/get-user") return DEMO_USER;
  if (/^\/profiles\/[^/]+\/get$/.test(path)) return DEMO_USER.profile;
  if (/^\/profiles\/patient\/[^/]+$/.test(path)) return DEMO_PATIENT_PROFILE;

  if (path === "/communities/my") return demoCommunitiesMine;
  if (path === "/communities/all") return { data: DEMO_ALL_COMMUNITIES };
  if (/^\/communities\/([^/]+)\/join$/.test(path)) {
    const id = path.split("/")[2];
    const found = DEMO_ALL_COMMUNITIES.find((c) => c._id === id);
    if (found && !demoCommunitiesMine.some((c) => c._id === id)) {
      demoCommunitiesMine = [...demoCommunitiesMine, { ...found, post_count: 0 }];
    }
    return { success: true };
  }
  if (/^\/communities\/([^/]+)\/leave$/.test(path)) {
    const id = path.split("/")[2];
    demoCommunitiesMine = demoCommunitiesMine.filter((c) => c._id !== id);
    return { success: true };
  }
  if (path === "/communities/create") {
    const newCommunity = {
      _id: `demo-comm-${Date.now()}`,
      community_name: body?.community_name || "New Group",
      member_count: 1,
      post_count: 0,
    };
    demoCommunitiesMine = [...demoCommunitiesMine, newCommunity];
    return newCommunity;
  }

  if (path === "/users/currency") {
    return m === "GET" ? { currency_code: "USD" } : { success: true };
  }
  if (path === "/users/supported-currencies") return ["USD", "NGN", "GBP", "EUR"];
  if (path === "/users/currency/history") return [];
  if (path === "/organizations") return DEMO_ORGANIZATIONS;

  if (path === "/medications/all") return { data: DEMO_MEDICATIONS };

  if (path === "/cart/user") return demoCart;
  if (path === "/cart/add") {
    const med = findMedication(body?.medication_id);
    if (med) {
      const existing = demoCart.items.find((i) => i.medication_id?._id === med._id);
      if (existing) {
        existing.quantity += body?.quantity || 1;
        demoCart = { items: [...demoCart.items] };
      } else {
        demoCart = {
          items: [
            ...demoCart.items,
            { _id: `demo-cart-${Date.now()}`, quantity: body?.quantity || 1, unit_price: 10.0, medication_id: med },
          ],
        };
      }
    }
    return { success: true };
  }
  if (/^\/cart\/item\/([^/]+)\/update$/.test(path)) {
    const id = path.split("/")[3];
    demoCart = { items: demoCart.items.map((i) => (i._id === id ? { ...i, quantity: body?.quantity ?? i.quantity } : i)) };
    return { success: true };
  }
  if (/^\/cart\/item\/([^/]+)\/delete$/.test(path)) {
    const id = path.split("/")[3];
    demoCart = { items: demoCart.items.filter((i) => i._id !== id) };
    return { success: true };
  }

  if (path === "/wishlist/user") return demoWishlist;
  if (path === "/wishlist/add") {
    const med = findMedication(body?.medication_id);
    if (med && !demoWishlist.items.some((i) => i.medication_id?._id === med._id)) {
      demoWishlist = { items: [...demoWishlist.items, { _id: `demo-wish-${Date.now()}`, medication_id: med }] };
    }
    return { success: true };
  }
  if (/^\/wishlist\/item\/([^/]+)$/.test(path)) {
    const id = path.split("/")[3];
    demoWishlist = { items: demoWishlist.items.filter((i) => i._id !== id) };
    return { success: true };
  }

  if (path === "/notifications/user") return demoNotifications;
  if (/^\/notifications\/([^/]+)\/read$/.test(path)) {
    const id = path.split("/")[2];
    demoNotifications = demoNotifications.map((n) => (n._id === id ? { ...n, is_read: true } : n));
    return { success: true };
  }
  if (path === "/notifications/read-all") {
    demoNotifications = demoNotifications.map((n) => ({ ...n, is_read: true }));
    return { success: true };
  }
  if (/^\/notifications\/([^/]+)\/delete$/.test(path)) {
    const id = path.split("/")[2];
    demoNotifications = demoNotifications.filter((n) => n._id !== id);
    return { success: true };
  }

  if (path === "/appointments/all") return demoAppointments;
  if (path === "/appointments/create") {
    const created = {
      _id: `demo-appt-${Date.now()}`,
      status: "scheduled",
      appointment_type: body?.appointment_type || "video",
      scheduled_start_time: body?.scheduled_start_time || daysFromNow(3),
      consultation_reason: body?.consultation_reason || "",
      provider_id: { username: "dr.chidi", profile: { first_name: "Chidi", last_name: "Eze" } },
    };
    demoAppointments = [...demoAppointments, created];
    return created;
  }
  if (/^\/appointments\/([^/]+)\/cancel$/.test(path)) {
    const id = path.split("/")[2];
    demoAppointments = demoAppointments.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a));
    return demoAppointments.find((a) => a._id === id);
  }
  if (/^\/appointments\/([^/]+)\/reschedule$/.test(path)) {
    const id = path.split("/")[2];
    demoAppointments = demoAppointments.map((a) =>
      a._id === id ? { ...a, scheduled_start_time: body?.scheduled_start_time || a.scheduled_start_time } : a,
    );
    return demoAppointments.find((a) => a._id === id);
  }
  if (/^\/appointments\/([^/]+)\/checkin$/.test(path)) return { success: true };
  if (/^\/appointments\/([^/]+)\/queue-position$/.test(path)) return { position: 2 };

  if (/^\/patients\/[^/]+\/prescriptions$/.test(path) && m === "GET") return DEMO_PRESCRIPTIONS;
  if (/^\/prescriptions\/([^/]+)$/.test(path) && m === "GET") {
    const id = path.split("/")[2];
    return DEMO_PRESCRIPTIONS.find((p) => p._id === id) || null;
  }

  if (path === "/labs/orders/all") return DEMO_LAB_ORDERS;
  if (/^\/labs\/orders\/([^/]+)$/.test(path) && m === "GET") {
    const id = path.split("/")[3];
    return DEMO_LAB_ORDERS.find((o) => o._id === id) || null;
  }

  if (/^\/insurance\/patient\/[^/]+$/.test(path)) return DEMO_INSURANCE;

  return undefined;
}
