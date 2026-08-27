import { apiFetch } from "./client";

export function login({email, password}){
    return apiFetch("api/auth/login", {
        method : "POST",
        body : JSON.stringify({email, password})
    });
}
