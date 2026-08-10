import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Rabbit,
  Check,
  Store,
  ShieldCheck,
  Landmark,
  ClipboardList,
  Loader2,
  Clock,
  XCircle,
  CreditCard,
  PartyPopper,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  submitApplication,
  getMyApplication,
  createPaymentOrder,
  confirmPaymentDev,
} from "../api/onboarding";

/**
 * Real status flow from RestaurantOnboardingService:
 *   UNDER_REVIEW -> APPROVED_PENDING_PAYMENT -> LIVE
 *                \-> REJECTED
 *
 * Payment can only be initiated once status is APPROVED_PENDING_PAYMENT —
 * createPaymentOrder() throws otherwise. So "submit" does NOT lead straight
 * to payment; it leads to a waiting screen that polls /applications/me.
 *
 * panCardNumber is sent below but RestaurantOnboardingApplicationRequest
 * doesn't have that field yet on the backend — confirm it's been added
 * before relying on this in a real submission.
 */

const COLORS = {
  primary: "#26187D",
  primaryLight: "#EEF0FF",
  bg: "#F6F7FF",
  success: "#16A34A",
  successBg: "#F0FDF4",
  pending: "#D97706",
  pendingBg: "#FFFBEB",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
};

const STEPS = [
  { key: "details", label: "Restaurant Details", icon: Store },
  { key: "compliance", label: "Compliance", icon: ShieldCheck },
  { key: "bank", label: "Bank Details", icon: Landmark },
  { key: "review", label: "Review & Submit", icon: ClipboardList },
];

const EMPTY_FORM = {
  restaurantName: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  fssaiLicense: "",
  gstin: "",
  panCardNumber: "",
  accountHolderName: "",
  accountNumber: "",
  bankName: "",
  ifscCode: "",
};

const VALIDATORS = {
  restaurantName: (v) => (!v.trim() ? "Restaurant name is required" : ""),
  addressLine: (v) => (!v.trim() ? "Address is required" : ""),
  city: (v) => (!v.trim() ? "City is required" : ""),
  state: (v) => (!v.trim() ? "State is required" : ""),
  pincode: (v) => (/^[0-9]{6}$/.test(v) ? "" : "Pincode must be 6 digits"),
  fssaiLicense: (v) =>
    /^[0-9]{14}$/.test(v) ? "" : "FSSAI license must be 14 digits",
  gstin: (v) =>
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v)
      ? ""
      : "Enter a valid GSTIN",
  panCardNumber: (v) =>
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v) ? "" : "Enter a valid PAN",
  accountHolderName: (v) => (!v.trim() ? "Account holder name is required" : ""),
  accountNumber: (v) =>
    /^[0-9]{9,18}$/.test(v) ? "" : "Account number must be 9-18 digits",
  bankName: (v) => (!v.trim() ? "Bank name is required" : ""),
  ifscCode: (v) =>
    /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v) ? "" : "Enter a valid IFSC code",
};

const FIELDS_BY_STEP = {
  details: ["restaurantName", "addressLine", "city", "state", "pincode"],
  compliance: ["fssaiLicense", "gstin", "panCardNumber"],
  bank: ["accountHolderName", "accountNumber", "bankName", "ifscCode"],
};

const FIELD_LABELS = {
  restaurantName: "Restaurant Name",
  addressLine: "Address",
  city: "City",
  state: "State",
  pincode: "Pincode",
  fssaiLicense: "FSSAI License Number",
  gstin: "GSTIN",
  panCardNumber: "PAN Card Number",
  accountHolderName: "Account Holder Name",
  accountNumber: "Account Number",
  bankName: "Bank Name",
  ifscCode: "IFSC Code",
};

function Field({ name, value, error, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {FIELD_LABELS[name]}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-slate-300 focus:border-[#26187D]"
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function StepIndicator({ currentIndex }) {
  return (
    <div className="flex items-center mb-10">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors"
                style={{
                  borderColor: done || active ? COLORS.primary : "#CBD5E1",
                  backgroundColor: done ? COLORS.primary : "white",
                }}
              >
                {done ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Icon
                    className="w-5 h-5"
                    style={{ color: active ? COLORS.primary : "#94A3B8" }}
                  />
                )}
              </div>
              <span
                className="text-xs font-semibold mt-2 text-center w-20"
                style={{ color: active || done ? COLORS.primary : "#94A3B8" }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 mb-6"
                style={{ backgroundColor: done ? COLORS.primary : "#E2E8F0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Onboarding() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  // checking | form | submitting | UNDER_REVIEW | APPROVED_PENDING_PAYMENT | REJECTED | LIVE
  const [phase, setPhase] = useState("checking");
  const [application, setApplication] = useState(null); // ApplicationSummaryResponse
  const [orderInfo, setOrderInfo] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // A user landing here from Login (not fresh off signup) may already have
  // an application in progress. Check on mount and resume wherever they
  // left off instead of always showing an empty wizard from step 1.
  useEffect(() => {
    (async () => {
      try {
        const summary = await getMyApplication(accessToken);
        setApplication(summary);
        setPhase(summary.status);
      } catch (err) {
        // No application yet is the expected case for a first-time
        // applicant — fall through to the wizard. Anything else, surface it.
        if (!/404|not found/i.test(err.message)) {
          setApiError(err.message);
        }
        setPhase("form");
      }
    })();
  }, [accessToken]);

  const stepKey = STEPS[stepIndex].key;

  function updateField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  }

  function validateStep(key) {
    const fieldNames = FIELDS_BY_STEP[key];
    if (!fieldNames) return true;
    const nextErrors = {};
    fieldNames.forEach((n) => {
      const msg = VALIDATORS[n](form[n]);
      if (msg) nextErrors[n] = msg;
    });
    setErrors((e) => ({ ...e, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  }

  function goNext() {
    if (!validateStep(stepKey)) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function refreshStatus() {
    setStatusLoading(true);
    setApiError("");
    try {
      const summary = await getMyApplication(accessToken);
      setApplication(summary);
      if (summary) setPhase(summary.status);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleSubmit() {
    setApiError("");
    setPhase("submitting");
    try {
      await submitApplication(form, accessToken);
      // submit response has no application id — fetch it via /me
      const summary = await getMyApplication(accessToken);
      setApplication(summary);
      setPhase(summary?.status ?? "UNDER_REVIEW");
    } catch (err) {
      setApiError(err.message);
      setPhase("form");
    }
  }

  async function handleCreateOrder() {
    setApiError("");
    setPayLoading(true);
    try {
      const order = await createPaymentOrder(application.id, accessToken);
      setOrderInfo(order);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setPayLoading(false);
    }
  }

  async function handleConfirmPayment() {
    setApiError("");
    setPayLoading(true);
    try {
      // Dev-only: simulating the payment gateway's webhook call directly.
      await confirmPaymentDev({
        orderId: orderInfo.orderId,
        paymentReference: `DUMMY-${Date.now()}`,
      });
      await refreshStatus();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setPayLoading(false);
    }
  }

  const isReview = stepKey === "review";

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-8">
          <Rabbit className="w-7 h-7" style={{ color: COLORS.primary }} />
          <span className="font-extrabold text-lg" style={{ color: COLORS.primary }}>
            Fatafat Partner Onboarding
          </span>
        </div>

        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {apiError}
          </div>
        )}

        {phase === "checking" && (
          <div className="bg-white rounded-xl shadow-sm p-16 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: COLORS.primary }} />
            <p className="text-sm text-slate-500">Loading your application…</p>
          </div>
        )}

        {phase === "form" && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <StepIndicator currentIndex={stepIndex} />

            {stepKey === "details" && (
              <div>
                <Field name="restaurantName" value={form.restaurantName} error={errors.restaurantName} onChange={updateField} placeholder="e.g. Spice Route Kitchen" />
                <Field name="addressLine" value={form.addressLine} error={errors.addressLine} onChange={updateField} placeholder="Shop no, street, area" />
                <div className="grid grid-cols-2 gap-4">
                  <Field name="city" value={form.city} error={errors.city} onChange={updateField} placeholder="City" />
                  <Field name="state" value={form.state} error={errors.state} onChange={updateField} placeholder="State" />
                </div>
                <Field name="pincode" value={form.pincode} error={errors.pincode} onChange={updateField} placeholder="6-digit pincode" />
              </div>
            )}

            {stepKey === "compliance" && (
              <div>
                <div className="mb-5 bg-[#EEF0FF] rounded-lg px-4 py-3 text-xs text-slate-600">
                  PAN capture is new on this form — confirm the backend
                  registration DTO accepts{" "}
                  <code className="font-mono">panCardNumber</code> before
                  relying on this in production.
                </div>
                <Field name="fssaiLicense" value={form.fssaiLicense} error={errors.fssaiLicense} onChange={updateField} placeholder="14-digit FSSAI number" />
                <Field name="gstin" value={form.gstin} error={errors.gstin} onChange={(n, v) => updateField(n, v.toUpperCase())} placeholder="15-character GSTIN" />
                <Field name="panCardNumber" value={form.panCardNumber} error={errors.panCardNumber} onChange={(n, v) => updateField(n, v.toUpperCase())} placeholder="10-character PAN" />
              </div>
            )}

            {stepKey === "bank" && (
              <div>
                <Field name="accountHolderName" value={form.accountHolderName} error={errors.accountHolderName} onChange={updateField} placeholder="As per bank records" />
                <Field name="accountNumber" value={form.accountNumber} error={errors.accountNumber} onChange={updateField} placeholder="9-18 digit account number" />
                <Field name="bankName" value={form.bankName} error={errors.bankName} onChange={updateField} placeholder="Bank name" />
                <Field name="ifscCode" value={form.ifscCode} error={errors.ifscCode} onChange={(n, v) => updateField(n, v.toUpperCase())} placeholder="IFSC code" />
              </div>
            )}

            {isReview && (
              <div>
                {STEPS.slice(0, 3).map((s) => (
                  <div key={s.key} className="mb-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                      {s.label}
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-1.5">
                      {FIELDS_BY_STEP[s.key].map((f) => (
                        <div key={f} className="flex justify-between text-sm">
                          <span className="text-slate-500">{FIELD_LABELS[f]}</span>
                          <span className="font-semibold text-slate-900">
                            {form[f] || "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={goBack}
                disabled={stepIndex === 0}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 disabled:opacity-0"
              >
                Back
              </button>
              {isReview ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Submit Application
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        )}

        {phase === "submitting" && (
          <div className="bg-white rounded-xl shadow-sm p-16 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: COLORS.primary }} />
            <p className="text-sm text-slate-500">Submitting your application…</p>
          </div>
        )}

        {phase === "UNDER_REVIEW" && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: COLORS.pendingBg }}
            >
              <Clock className="w-8 h-8" style={{ color: COLORS.pending }} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">
              Under review
            </h2>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              We're reviewing your application (attempt #{application?.attemptNumber}).
              This usually takes 24-48 hours. Once approved, you'll be able to
              pay the onboarding fee and go live.
            </p>
            <button
              onClick={refreshStatus}
              disabled={statusLoading}
              className="px-5 py-2 rounded-lg text-sm font-semibold border"
              style={{ borderColor: COLORS.pending, color: COLORS.pending }}
            >
              {statusLoading ? "Checking…" : "Check Status"}
            </button>
          </div>
        )}

        {phase === "REJECTED" && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: COLORS.dangerBg }}
            >
              <XCircle className="w-8 h-8" style={{ color: COLORS.danger }} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">
              Application not approved
            </h2>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              Your application wasn't approved this time. Reach out to support
              for the specific reason — this screen can't show it yet, since{" "}
              <code className="font-mono text-xs">ApplicationSummaryResponse</code>{" "}
              doesn't carry a rejection reason field, even though the backend
              stores one.
            </p>
          </div>
        )}

        {phase === "APPROVED_PENDING_PAYMENT" && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <CreditCard className="w-10 h-10 mx-auto mb-4" style={{ color: COLORS.primary }} />
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">
              You're approved! Complete payment to go live
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              One-time onboarding fee for {application?.restaurantName}.
            </p>

            {!orderInfo ? (
              <button
                onClick={handleCreateOrder}
                disabled={payLoading}
                className="px-6 py-3 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: COLORS.primary }}
              >
                {payLoading ? "Creating order…" : "Create Payment Order"}
              </button>
            ) : (
              <div>
                <div className="bg-slate-50 rounded-lg px-4 py-3 mb-6 text-sm text-slate-600 inline-block">
                  Order ID: <span className="font-mono">{orderInfo.orderId}</span>
                  {" · "}
                  Amount: <span className="font-mono">₹{orderInfo.amount}</span>
                </div>
                <div>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={payLoading}
                    className="px-6 py-3 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    {payLoading ? "Confirming…" : "Pay Now (Dummy)"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === "LIVE" && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: COLORS.successBg }}
            >
              <PartyPopper className="w-8 h-8" style={{ color: COLORS.success }} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">
              You're live on Fatafat!
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {application?.restaurantName} is ready to take orders.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: COLORS.primary }}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}