import React, { useState, createContext, useContext } from 'react';

const OnboardingContext = createContext();

const Onboarding = () => {
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

  const [next, setNext] = setStep((prev) => prev + 1);
  const [prev, setPrev] = setStep((prev) => prev - 1);
  const updateForm = (fields) => setForm((prev) => ({...prev, ...fields}))

  return (
    <OnboardingContext.Provider value = {{step, form, next, prev, updateForm}}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function OnboardingFlow() {
  const {step, form, next, prev, updateForm} = useContext(OnboardingContext)

  switch(step){
    case 1:
      return  (
        <div>
          <h2>Step 1 : Fill your basic details</h2>
          <input
            value={form.name}
            onChange={e => updateForm({name : e.target.value})}
          />
          <input
            value={form.address}
            onChange={e => updateForm({address : e.target.value})}
          />
          <input
            value={form.city}
            onChange={e => updateForm({city : e.target.value})}
          />
          <input
            value={form.state}
            onChange={e => updateForm({state : e.target.value})}
          />
          <input
            value={form.pincode}
            onChange={e => updateForm({pincode : e.target.value})}
          />
          <button  onClick={next} disabled={!form.name || !form.address || !form.city || !form.state || !form.pincode}>Next</button>
        </div>
      )
    case 2 :
      return (
        <div>
          <h2>Fill your compliance details</h2>
          <input
            value={form.fssai}
            onChange={e => updateForm({fssai : e.target.value})}
          />
          <input
            value={form.gstin}
            onChange={e => updateForm({gstin : e.target.value})}
          />
          <button  onClick={prev} disabled={!form.fssai || !form.gstin}>Back</button>
        </div>
      )

  }
}

export default Onboarding