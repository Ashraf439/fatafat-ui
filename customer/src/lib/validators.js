// Client-side mirrors of the backend's validation rules, for instant feedback only.
// The server remains the source of truth.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_RE = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/;
export const PHONE_RE = /^[6-9]\d{9}$/;
export const PINCODE_RE = /^\d{6}$/;

export const required = (label) => (v) => (String(v ?? "").trim() ? null : `${label} is required`);
export const email = (v) => (EMAIL_RE.test(String(v ?? "").trim()) ? null : "Enter a valid email address");
export const phone = (v) => (PHONE_RE.test(String(v ?? "").trim()) ? null : "Enter a valid 10-digit mobile number");
export const pincode = (v) => (PINCODE_RE.test(String(v ?? "").trim()) ? null : "Pincode must be 6 digits");

export function password(v) {
  const s = String(v ?? "");
  if (s.length < 8 || s.length > 64) return "Password must be 8–64 characters";
  if (!PASSWORD_RE.test(s)) return "Use a digit, lowercase, uppercase and one of @#$%^&+=!";
  return null;
}

/** Runs { field: [rules...] } against values and returns { field: firstError } for failures only. */
export function validate(values, rules) {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const message = rule(values[field], values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  }
  return errors;
}
