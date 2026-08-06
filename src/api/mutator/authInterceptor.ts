import { InternalAxiosRequestConfig } from "axios";
import { getAuth } from "firebase/auth";
import app from "@/src/firebase";
import { getAdminJwtToken, isAdminJwtTokenValid } from "@/src/utils/adminJwtStorage";

/**
 * Attaches the caller's credential to every outgoing API request.
 *
 * Registered as an `AXIOS_INSTANCE` request interceptor from `_app.tsx` (it only
 * works in a react-dom environment). It lives in its own module so tests can
 * exercise the real interceptor instead of re-implementing it — the publisher
 * dashboard's `include_banned=true` opt-in is only honoured by the backend when
 * the request carries the caller's Firebase token, so that header is a
 * behavioural requirement, not an incidental detail.
 */
export const attachAuthHeaders = async (config: InternalAxiosRequestConfig) => {
  const method = (config.method || "GET").toUpperCase();
  const path = (config.url || "").split("?")[0];

  // Admin-JWT endpoints are all mutations; gating on method prevents IDs like
  // "bananaforge" from matching the /ban suffix on a GET.
  const requiresAdminJwt =
    method !== "GET" &&
    (path.endsWith("/ban") ||
      (path.startsWith("/admin/") && !path.startsWith("/admin/generate-token")));

  if (requiresAdminJwt) {
    // Use JWT admin token for admin operations
    const adminToken = getAdminJwtToken();
    if (adminToken && isAdminJwtTokenValid()) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else {
      // Throw specific error that will be caught by the mutation error handler
      throw new Error("ADMIN_JWT_REQUIRED");
    }
  } else {
    // Use Firebase token for regular operations
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      sessionStorage.setItem("idToken", token);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const cachedIdtoken = sessionStorage.getItem("idToken") ?? "";
      if (cachedIdtoken) config.headers.Authorization = `Bearer ${cachedIdtoken}`;
    }
  }
  return config;
};
