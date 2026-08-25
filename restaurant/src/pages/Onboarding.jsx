import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { Navigate  } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  submitApplication,
  getMyApplication,
  createPaymentOrder,
  verifyPayment,
} from "../api/onboarding";

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

      if (
        /404|204|not found|no content/i.test(
          error?.message || ""
        )
      ) {
        setApplication(null);
        setPhase("form");
        return;
      }

      setApiError(
        error?.message || "Failed to load application."
      );

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

      await submitApplication(
        form,
        accessToken
      );

      await refreshApplication();

    } catch (error) {
      setApiError(
        error?.message ||
          "Failed to submit application."
      );

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
        const order = await createPaymentOrder(
            application.id,
            accessToken
        );

        console.log("Payment order:", order);

        if (!order?.orderId || !order?.amount) {
            throw new Error(
                "Invalid payment order received from backend"
            );
        }

        // 2. Check Razorpay SDK
        if (!window.Razorpay) {
            throw new Error(
                "Razorpay SDK is not loaded"
            );
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
                console.log(
                    "Razorpay payment successful"
                );

                console.log(
                    "Order ID:",
                    response.razorpay_order_id
                );

                console.log(
                    "Payment ID:",
                    response.razorpay_payment_id
                );

                console.log(
                    "Signature:",
                    response.razorpay_signature
                );

                try {
                    // 4. Verify payment with backend
                    const verification = await verifyPayment(
                        response.razorpay_order_id,
                        response.razorpay_payment_id,
                        response.razorpay_signature,
                        accessToken
                    );

                    console.log(
                        "Payment verification:",
                        verification
                    );

                    // 5. Reload application
                    await refreshApplication();

                } catch (error) {
                    console.error(
                        "Backend payment verification failed:",
                        error
                    );

                    setApiError(
                        error?.message ||
                        "Payment verification failed."
                    );
                }
            },

            prefill: {
                name: account?.name || "",
                email: account?.email || "",
                contact: account?.phoneNumber || ""
            },

            notes: {
                applicationId: String(application.id)
            },

            theme: {
                color: "#3399cc"
            },

            modal: {
                ondismiss: function () {
                    console.log(
                        "Razorpay checkout closed"
                    );
                }
            }
        };

        console.log(
            "Razorpay options:",
            options
        );

        // 6. Open Razorpay
        const razorpay =
            new window.Razorpay(options);

        razorpay.on(
            "payment.failed",
            function (response) {
                console.error(
                    "Razorpay payment failed:",
                    response.error
                );

                setApiError(
                    response?.error?.description ||
                    "Payment failed."
                );
            }
        );

        razorpay.open();

    } catch (error) {
        console.error(
            "Unable to start payment:",
            error
        );

        setApiError(
            error?.message ||
            "Unable to start payment."
        );

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
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">

      <div className="w-full max-w-xl bg-white rounded-md shadow-lg p-6">

        {apiError && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">
            {apiError}
          </div>
        )}

        {step === 1 && (
          <>
            <h1 className="text-2xl font-semibold text-center text-purple-700 mb-6">
              Step 1: Restaurant Details
            </h1>


            <Input
              label="Restaurant Name"
              value={form.restaurantName}
              onChange={(value) =>
                updateForm({
                  restaurantName: value,
                })
              }
            />


            <Input
              label="Address"
              value={form.addressLine}
              onChange={(value) =>
                updateForm({
                  addressLine: value,
                })
              }
            />


            <Input
              label="City"
              value={form.city}
              onChange={(value) =>
                updateForm({
                  city: value,
                })
              }
            />


            <Input
              label="State"
              value={form.state}
              onChange={(value) =>
                updateForm({
                  state: value,
                })
              }
            />


            <Input
              label="Pincode"
              value={form.pincode}
              onChange={(value) =>
                updateForm({
                  pincode: value,
                })
              }
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
              className="w-full mt-5 px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-semibold text-center text-purple-700 mb-6">
              Step 2: Compliance Details
            </h1>


            <Input
              label="FSSAI License"
              value={form.fssaiLicense}
              onChange={(value) =>
                updateForm({
                  fssaiLicense: value,
                })
              }
            />


            <Input
              label="GSTIN"
              value={form.gstin}
              onChange={(value) =>
                updateForm({
                  gstin: value,
                })
              }
            />


            <div className="flex justify-between mt-5">

              <button
                type="button"
                onClick={prev}
                className="px-4 py-2 text-purple-700 border border-purple-700 rounded-md hover:bg-purple-100"
              >
                Back
              </button>


              <button
                type="button"
                onClick={next}
                className="px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600"
              >
                Next
              </button>

            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-2xl font-semibold text-center text-purple-700 mb-6">
              Step 3: Bank Details
            </h1>


            <Input
              label="Account Holder Name"
              value={form.accountHolderName}
              onChange={(value) =>
                updateForm({
                  accountHolderName: value,
                })
              }
            />


            <Input
              label="Account Number"
              value={form.accountNumber}
              onChange={(value) =>
                updateForm({
                  accountNumber: value,
                })
              }
            />


            <Input
              label="IFSC Code"
              value={form.ifscCode}
              onChange={(value) =>
                updateForm({
                  ifscCode: value,
                })
              }
            />


            <Input
              label="Bank Name"
              value={form.bankName}
              onChange={(value) =>
                updateForm({
                  bankName: value,
                })
              }
            />


            <div className="flex justify-between mt-5">

              <button
                type="button"
                onClick={prev}
                className="px-4 py-2 text-purple-700 border border-purple-700 rounded-md hover:bg-purple-100"
              >
                Back
              </button>


              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600 disabled:bg-slate-300"
              >
                {loading
                  ? "Submitting..."
                  : "Submit Application"}
              </button>

            </div>
          </>
        )}

      </div>
    </div>
  );
};



const Input = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="mb-4">

      <label className="block text-sm font-semibold text-gray-800">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring"
      />

    </div>
  );
};



const ApplicationStatus = () => {
  const {
    application,
    apiError,
    handlePayment,
    paymentLoading,
  } = useContext(OnboardingContext);


  if (!application) {
    return null;
  }


  if (
    application.status ===
    "UNDER_REVIEW"
  ) {
    return (
      <StatusCard
        title="Application Under Review"
        message="Your restaurant application has been submitted and is currently being reviewed by our team."
      />
    );
  }

  if (
    application.status ===
    "APPROVED_PENDING_PAYMENT"
  ) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">

        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">

          <div className="text-4xl mb-4">
            ✓
          </div>

          <h1 className="text-2xl font-semibold text-purple-700">
            Application Approved
          </h1>

          <p className="mt-3 text-gray-600">
            Your restaurant application has been approved.
            Complete the onboarding payment to activate
            your restaurant.
          </p>


          {apiError && (
            <div className="mt-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">
              {apiError}
            </div>
          )}


          <button
            type="button"
            onClick={handlePayment}
            disabled={paymentLoading}
            className="w-full mt-6 px-4 py-3 text-white bg-purple-700 rounded-md hover:bg-purple-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {paymentLoading
              ? "Opening Payment..."
              : "Pay Now"}
          </button>

        </div>

      </div>
    );
  }



  if (
    application.status ===
    "LIVE"
  ) {
    return (
       <Navigate to="/dashboard" replace />
    );
  }



  if (
    application.status ===
    "REJECTED"
  ) {
    return (
      <StatusCard
        title="Application Rejected"
        message={
          application.rejectionReason ||
          "Your application was rejected."
          
        }
      />
    );
  }


  return null;
};



const StatusCard = ({
  title,
  message,
}) => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">

        <h1 className="text-2xl font-semibold text-purple-700">
          {title}
        </h1>

        <p className="mt-4 text-gray-600">
          {message}
        </p>

      </div>

    </div>
  );
};


const OnboardingFlow = () => {
  const {
    phase,
    application,
    apiError,
  } = useContext(OnboardingContext);


  /*
   * Loading application state
   */

  if (phase === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Checking your application...
        </p>
      </div>
    );
  }


  /*
   * Error
   */

  if (
    phase === "error"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">

        <div className="text-center">

          <h1 className="text-xl font-semibold text-red-600">
            Something went wrong
          </h1>

          <p className="mt-2 text-gray-600">
            {apiError}
          </p>

        </div>

      </div>
    );
  }


  /*
   * No application → show form
   */

  if (
    phase === "form" ||
    !application
  ) {
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