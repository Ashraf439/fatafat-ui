import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  submitApplication,
  getMyApplication,
  createPaymentOrder,
  verifyPayment,
} from "../api/onboarding";

import {
  StatusScreen,
  PipelineStepper,
  IconClock,
  IconCheck,
  IconCard,
  IconX,
  IconAlert,
} from "../components/StatusScreen";

const OnboardingContext = createContext(null);

const initialForm = {
  restaurantName: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  fssaiLicense: "",
  gstin: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
};

const OnboardingProvider = ({ children }) => {
  const { accessToken, account } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);

  const [application, setApplication] = useState(null);

  const [phase, setPhase] = useState("checking");

  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [apiError, setApiError] = useState("");

  /*
   * ---------------------------------------------------------
   * FETCH APPLICATION
   * ---------------------------------------------------------
   */

  const refreshApplication = async () => {
    if (!accessToken) {
      return;
    }

    try {
      setApiError("");

      const result = await getMyApplication(accessToken);

      if (!result) {
        setApplication(null);
        setPhase("form");
        return;
      }

      setApplication(result);
      setPhase(result.status);
    } catch (error) {
      if (/404|204|not found|no content/i.test(error?.message || "")) {
        setApplication(null);
        setPhase("form");
        return;
      }

      setApiError(error?.message || "Failed to load application.");

      setPhase("error");
    }
  };

  useEffect(() => {
    refreshApplication();
  }, [accessToken]);

  const next = () => {
    setStep((previous) => previous + 1);
  };

  const prev = () => {
    setStep((previous) => previous - 1);
  };

  const updateForm = (fields) => {
    setForm((previous) => ({
      ...previous,
      ...fields,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setApiError("");

      await submitApplication(form, accessToken);

      await refreshApplication();
    } catch (error) {
      setApiError(error?.message || "Failed to submit application.");

      setPhase("form");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!application?.id) {
      console.error("Application ID is missing");
      return;
    }

    try {
      setPaymentLoading(true);
      setApiError("");

      // 1. Create Razorpay order through backend
      const order = await createPaymentOrder(application.id, accessToken);

      console.log("Payment order:", order);

      if (!order?.orderId || !order?.amount) {
        throw new Error("Invalid payment order received from backend");
      }

      // 2. Check Razorpay SDK
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK is not loaded");
      }

      // 3. Razorpay checkout configuration
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: Number(order.amount),

        currency: "INR",

        name: "Fatafat",

        description: "Restaurant Onboarding Fee",

        order_id: order.orderId,

        handler: async function (response) {
          console.log("Razorpay payment successful");

          console.log("Order ID:", response.razorpay_order_id);

          console.log("Payment ID:", response.razorpay_payment_id);

          console.log("Signature:", response.razorpay_signature);

          try {
            // 4. Verify payment with backend
            const verification = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              accessToken
            );

            console.log("Payment verification:", verification);

            // 5. Reload application
            await refreshApplication();
          } catch (error) {
            console.error("Backend payment verification failed:", error);

            setApiError(error?.message || "Payment verification failed.");
          }
        },

        prefill: {
          name: account?.name || "",
          email: account?.email || "",
          contact: account?.phoneNumber || "",
        },

        notes: {
          applicationId: String(application.id),
        },

        theme: {
          color: "#CD0000",
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout closed");
          },
        },
      };

      console.log("Razorpay options:", options);

      // 6. Open Razorpay
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);

        setApiError(response?.error?.description || "Payment failed.");
      });

      razorpay.open();
    } catch (error) {
      console.error("Unable to start payment:", error);

      setApiError(error?.message || "Unable to start payment.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        step,
        form,
        next,
        prev,
        updateForm,

        application,
        phase,

        loading,
        paymentLoading,

        apiError,

        handleSubmit,
        handlePayment,

        refreshApplication,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

const STEP_LABELS = ["Restaurant", "Compliance", "Bank"];

const StepIndicator = ({ step }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {STEP_LABELS.map((label, index) => {
      const num = index + 1;
      const active = num === step;
      const done = num < step;
      return (
        <div key={label} className="flex items-center">
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
              done
                ? "bg-[#CD0000] text-white"
                : active
                ? "bg-[#CD0000] text-white"
                : "bg-[#EFEDE6] text-[#1C1B19]/50"
            }`}
          >
            {done ? "✓" : num}
          </div>
          {num !== STEP_LABELS.length && (
            <div
              className={`w-8 h-0.5 mx-1 ${
                done ? "bg-[#CD0000]" : "bg-[#EFEDE6]"
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

const ApplicationForm = () => {
  const {
    step,
    form,
    next,
    prev,
    updateForm,
    handleSubmit,
    loading,
    apiError,
  } = useContext(OnboardingContext);

  return (
    <div className="bg-[#EFEDE6] min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-sm border border-black/5 p-8">
        <StepIndicator step={step} />

        {apiError && (
          <div
            role="alert"
            className="mb-5 px-3 py-2 rounded-lg bg-[#CD0000]/10 text-[#CD0000] text-sm"
          >
            {apiError}
          </div>
        )}

        {step === 1 && (
          <>
            <h1 className="text-xl font-semibold text-[#1C1B19] mb-6">
              Restaurant Details
            </h1>

            <Input
              label="Restaurant Name"
              value={form.restaurantName}
              onChange={(value) => updateForm({ restaurantName: value })}
            />

            <Input
              label="Address"
              value={form.addressLine}
              onChange={(value) => updateForm({ addressLine: value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={form.city}
                onChange={(value) => updateForm({ city: value })}
              />

              <Input
                label="State"
                value={form.state}
                onChange={(value) => updateForm({ state: value })}
              />
            </div>

            <Input
              label="Pincode"
              value={form.pincode}
              onChange={(value) => updateForm({ pincode: value })}
            />

            <button
              type="button"
              onClick={next}
              disabled={
                !form.restaurantName ||
                !form.addressLine ||
                !form.city ||
                !form.state ||
                !form.pincode
              }
              className="w-full mt-2 px-4 py-2.5 text-white font-medium bg-[#CD0000] rounded-lg hover:bg-[#A80000] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/40 focus:ring-offset-2 transition-colors disabled:bg-[#1C1B19]/20 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-xl font-semibold text-[#1C1B19] mb-6">
              Compliance Details
            </h1>

            <Input
              label="FSSAI License"
              value={form.fssaiLicense}
              onChange={(value) => updateForm({ fssaiLicense: value })}
            />

            <Input
              label="GSTIN"
              value={form.gstin}
              onChange={(value) => updateForm({ gstin: value })}
            />

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prev}
                className="px-4 py-2.5 text-[#1C1B19] border border-[#1C1B19]/15 rounded-lg hover:bg-[#EFEDE6] transition-colors"
              >
                Back
              </button>

              <button
                type="button"
                onClick={next}
                disabled={!form.fssaiLicense || !form.gstin}
                className="px-4 py-2.5 text-white font-medium bg-[#CD0000] rounded-lg hover:bg-[#A80000] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/40 focus:ring-offset-2 transition-colors disabled:bg-[#1C1B19]/20 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-xl font-semibold text-[#1C1B19] mb-6">
              Bank Details
            </h1>

            <Input
              label="Account Holder Name"
              value={form.accountHolderName}
              onChange={(value) => updateForm({ accountHolderName: value })}
            />

            <Input
              label="Account Number"
              value={form.accountNumber}
              onChange={(value) => updateForm({ accountNumber: value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="IFSC Code"
                value={form.ifscCode}
                onChange={(value) => updateForm({ ifscCode: value })}
              />

              <Input
                label="Bank Name"
                value={form.bankName}
                onChange={(value) => updateForm({ bankName: value })}
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prev}
                disabled={loading}
                className="px-4 py-2.5 text-[#1C1B19] border border-[#1C1B19]/15 rounded-lg hover:bg-[#EFEDE6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !form.accountHolderName ||
                  !form.accountNumber ||
                  !form.ifscCode ||
                  !form.bankName
                }
                className="px-4 py-2.5 text-white font-medium bg-[#CD0000] rounded-lg hover:bg-[#A80000] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/40 focus:ring-offset-2 transition-colors disabled:bg-[#1C1B19]/20 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[#1C1B19]">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="block w-full px-4 py-2.5 mt-1.5 text-[#1C1B19] bg-[#EFEDE6] border border-transparent rounded-lg focus:bg-white focus:border-[#CD0000] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/20 transition-colors"
      />
    </div>
  );
};

const applicationMeta = (application) => {
  const meta = [];
  if (application?.id) {
    meta.push({ label: "Ref", value: `#${application.id}` });
  }
  if (application?.createdAt) {
    meta.push({
      label: "Submitted",
      value: new Date(application.createdAt).toLocaleDateString(),
    });
  }
  return meta;
};

const ApplicationStatus = () => {
  const { application, apiError, handlePayment, paymentLoading } =
    useContext(OnboardingContext);

  if (!application) {
    return null;
  }

  if (application.status === "UNDER_REVIEW") {
    return (
      <StatusScreen
        icon={<IconClock />}
        tone="neutral"
        eyebrow="Application status"
        title="Under review"
        message="Your application is with our onboarding team. We'll notify you by email as soon as a decision is made — this usually takes 1–2 business days."
        meta={applicationMeta(application)}
      >
        <PipelineStepper currentStage="UNDER_REVIEW" />
      </StatusScreen>
    );
  }

  if (application.status === "APPROVED_PENDING_PAYMENT") {
    return (
      <StatusScreen
        icon={<IconCard />}
        tone="accent"
        eyebrow="Application status"
        title="Approved — payment required"
        message="Your restaurant has been approved. Complete the one-time onboarding fee to activate your account."
        meta={applicationMeta(application)}
        error={apiError}
      >
        <PipelineStepper currentStage="APPROVED_PENDING_PAYMENT" />

        <button
          type="button"
          onClick={handlePayment}
          disabled={paymentLoading}
          className="w-full mt-6 px-4 py-3 text-white font-medium bg-[#CD0000] rounded-md hover:bg-[#A80000] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/40 focus:ring-offset-2 transition-colors disabled:bg-[#1C1B19]/20 disabled:cursor-not-allowed"
        >
          {paymentLoading ? "Opening payment…" : "Pay onboarding fee"}
        </button>
      </StatusScreen>
    );
  }

  if (application.status === "LIVE") {
    return <Navigate to="/dashboard" replace />;
  }

  if (application.status === "REJECTED") {
    return (
      <StatusScreen
        icon={<IconX />}
        tone="danger"
        eyebrow="Application status"
        title="Application rejected"
        message={
          application.rejectionReason ||
          "Your application did not meet our onboarding requirements."
        }
        meta={applicationMeta(application)}
      >
        <PipelineStepper currentStage="UNDER_REVIEW" rejected />
      </StatusScreen>
    );
  }

  return null;
};

const OnboardingFlow = () => {
  const { phase, application, apiError } = useContext(OnboardingContext);

  /*
   * Loading application state
   */

  if (phase === "checking") {
    return (
      <div className="bg-[#EFEDE6] min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#1C1B19]/60">
          <span className="w-4 h-4 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono">Checking your application…</p>
        </div>
      </div>
    );
  }

  /*
   * Error
   */

  if (phase === "error") {
    return (
      <StatusScreen
        icon={<IconAlert />}
        tone="danger"
        eyebrow="Error"
        title="Something went wrong"
        message={apiError || "We couldn't load your application. Please try again."}
      />
    );
  }

  /*
   * No application → show form
   */

  if (phase === "form" || !application) {
    return <ApplicationForm />;
  }

  /*
   * Application exists → show status
   */

  return <ApplicationStatus />;
};

/*
 * ============================================================
 * ONBOARDING
 * ============================================================
 */

const Onboarding = () => {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
};

export default Onboarding;