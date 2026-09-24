import { pincode, required } from "@/lib/validators";

export const ADDRESS_RULES = {
  street: [required("Street")],
  landmark: [required("Landmark")],
  city: [required("City")],
  state: [required("State")],
  pincode: [pincode],
};
