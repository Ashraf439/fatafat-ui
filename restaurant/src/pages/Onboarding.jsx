import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  submitApplication,
  getMyApplication,
  createPaymentOrder,
  confirmPaymentDev,
} from "../api/onboarding";

const OnboardingContext = createContext();

const OnboardingProvider = ({ children }) => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name:'',
    address:'',
    city:'',
    state:'',
    pincode:'',
    fssai:'',
    gstin:''
  });

  const next = () => setStep((prev) => prev + 1);
  const prev = () => setStep((prev) => prev - 1);
  const updateForm = (fields) => setForm((prev) => ({...prev, ...fields}));

  const [phase, setPhase] = useState("checking");
  const [application, setApplication] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const summary = await getMyApplication(accessToken);
        setApplication(summary);
        setPhase(summary.status);
      } catch (err) {
        if (!/404|not found/i.test(err.message)) {
          setApiError(err.message);
        }
        setPhase("form");
      }
    })();
  }, [accessToken]);

  return (
    <OnboardingContext.Provider value={{step, form, next, prev, updateForm}}>
      {children}
    </OnboardingContext.Provider>
  );
};

const OnboardingFlow = () => {
  const { step, form, next, prev, updateForm } = useContext(OnboardingContext);

  return (
    <div className="bg-gray-100 relative flex flex-col justify-center min-h-screen overflow-hidden">
      <div className="w-full p-6 m-auto bg-white rounded-md ring-2 ring-purple-600 lg:max-w-xl">
        {step === 1 && (
          <>
            <h1 className="text-2xl font-semibold text-center text-purple-700 mb-4">
              Step 1: Fill your basic details
            </h1>
            <form>
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-800">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md 
                             focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-800">Address</label>
                <input
                  value={form.address}
                  onChange={(e) => updateForm({ address: e.target.value })}
                  className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md 
                             focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-800">City</label>
                <input
                  value={form.city}
                  onChange={(e) => updateForm({ city: e.target.value })}
                  className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md 
                             focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-800">State</label>
                <input
                  value={form.state}
                  onChange={(e) => updateForm({ state: e.target.value })}
                  className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md 
                             focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-800">Pincode</label>
                <input
                  value={form.pincode}
                  onChange={(e) => updateForm({ pincode: e.target.value })}
                  className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md 
                             focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                />
              </div>
              <button
                type="button"
                onClick={next}
                disabled={!form.name || !form.address || !form.city || !form.state || !form.pincode}
                className="w-full mt-4 px-4 py-2 tracking-wide text-white transition-colors duration-200 
                           transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none 
                           focus:bg-purple-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-semibold text-center text-purple-700 mb-4">
              Step 2: Compliance details
            </h1>
            <form>
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-800">FSSAI</label>
                <input
                  value={form.fssai}
                  onChange={(e) => updateForm({ fssai: e.target.value })}
                  className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md 
                             focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-800">GSTIN</label>
                <input
                  value={form.gstin}
                  onChange={(e) => updateForm({ gstin: e.target.value })}
                  className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md 
                             focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                />
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={prev}
                  className="px-4 py-2 text-purple-700 border border-purple-700 rounded-md hover:bg-purple-100"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};


const Onboarding = () => (
  <OnboardingProvider>
    <OnboardingFlow />
  </OnboardingProvider>
);

export default Onboarding;