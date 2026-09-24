import { useState } from "react";
import { validate } from "@/lib/validators";

/**
 * Minimal controlled-form helper.
 *   const form = useForm(initialValues, rules);
 *   <Input {...form.field("email")} />  ->  value / onChange / aria-invalid
 *   form.error("email")                 ->  message once the field was touched or submit was tried
 *   form.submit(async (values) => ...)  ->  validates first; returns an onSubmit handler
 */
export function useForm(initialValues, rules = {}) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(values, rules);

  const setValue = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  const error = (name) => (submitted || touched[name] ? errors[name] : undefined);

  const field = (name) => ({
    name,
    value: values[name] ?? "",
    onChange: (e) => setValue(name, e.target.value),
    onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
    "aria-invalid": error(name) ? true : undefined,
  });

  const submit = (handler) => (e) => {
    e?.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    return handler(values);
  };

  const reset = (next = initialValues) => {
    setValues(next);
    setTouched({});
    setSubmitted(false);
  };

  return { values, setValue, setValues, field, error, submit, reset, isValid: Object.keys(errors).length === 0 };
}
