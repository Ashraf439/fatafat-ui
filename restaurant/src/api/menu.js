import { apiFetch } from "./client";

export function uploadMenu(file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/api/restaurant/menu-upload", {
    method: "POST",
    body: formData,
  });
}

export function getMenuItems() {
  return apiFetch("/api/restaurant/menu");
}
export function uploadMenuItemImage(menuId, file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch(`/api/restaurant/menu/${menuId}/image`, { method: "POST", body: formData });
}