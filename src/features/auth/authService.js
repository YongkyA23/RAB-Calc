import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase/app";

const LOCAL_AUTH_KEY = "rab-calc.local-auth";

export function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(LOCAL_AUTH_KEY));
}

export function getLocalUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function signInLocal(role = "Admin", name = "Local Admin", email = "admin@local.test") {
  const localUser = {
    uid: role === "Admin" ? "local-admin-uid" : "local-estimator-uid",
    displayName: name,
    email: email,
    role: role,
    isLocal: true,
  };
  localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(localUser));
  window.dispatchEvent(new Event("rab-calc:auth-change"));
  return localUser;
}

export function subscribeToAuthState(callback) {
  const checkAndNotify = () => {
    const localUser = getLocalUser();
    if (localUser) {
      callback(localUser);
      return true;
    }
    return false;
  };

  const initialHandled = checkAndNotify();

  const handleLocalChange = () => {
    if (!checkAndNotify()) {
      callback(null);
    }
  };
  window.addEventListener("rab-calc:auth-change", handleLocalChange);

  let unsubscribeFirebase = () => {};
  try {
    unsubscribeFirebase = onAuthStateChanged(auth, (fbUser) => {
      if (!getLocalUser()) {
        callback(fbUser);
      }
    });
  } catch {
    if (!initialHandled) callback(null);
  }

  return () => {
    window.removeEventListener("rab-calc:auth-change", handleLocalChange);
    unsubscribeFirebase();
  };
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
  if (user?.isLocal || user?.uid?.startsWith("local-")) {
    return {
      portalAccess: true,
      appId: "rab-calc",
      ssoVersion: 2,
      centralUid: user.uid,
      grantVersion: 1,
      role: user.role === "Admin" ? "admin" : "estimator",
    };
  }
  const token = await user.getIdTokenResult(true);
  return token.claims;
}

export async function signOutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_AUTH_KEY);
    window.dispatchEvent(new Event("rab-calc:auth-change"));
  }
  try {
    return await signOut(auth);
  } catch {
    // Graceful fallback for offline mode
  }
}
