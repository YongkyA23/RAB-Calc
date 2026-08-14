import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase/app";

export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export function portalLoginUrl() {
  return (
    import.meta.env.VITE_SSO_PORTAL_URL ||
    (import.meta.env.DEV
      ? "http://localhost:5173"
      : "https://staging-portal.collabproject.web.id/")
  );
}

export async function getPortalSessionClaims(user) {
  const token = await user.getIdTokenResult(true);
  return token.claims;
}

export async function signOutUser() {
  return signOut(auth);
}
