const BASE_URL = "http://localhost:8080";

export async function apiFetch(
    url,{
        method = "GET",
        body,
        accessToken
    } = {}
){
    const headers = {"Content-type" : "application/json"};
    if(accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }
    const response = await fetch(`${BASE_URL}/${url}`,{
        method,
        headers,
        body,
    })
    if(!response.ok){
        const text = await response.text();
        throw new Error(text || "Request failed")
    }

    if(response.status == 204){
        return null;
    }

    return response.json();
}