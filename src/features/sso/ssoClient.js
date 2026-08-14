import {
  browserSessionPersistence,
  setPersistence,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";

const APP_ID = "rab-calc";
const SESSION_KEY = "lphtm.sso.rab-calc.v1";
const SESSION_TTL_MS = 5 * 60 * 1000;
const CODE_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const STATE_PATTERN = /^[A-Za-z0-9._~-]{16,128}$/;

function base64Url(bytes) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function randomValue(size) {
  return base64Url(crypto.getRandomValues(new Uint8Array(size)));
}

function safeReturnTo(value, fallback = "/estimates") {
  return value?.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/sso")
    ? value
    : fallback;
}

function portalUrl() {
  const configured = import.meta.env.VITE_SSO_PORTAL_URL;
  return (
    configured ||
    (import.meta.env.DEV
      ? "http://localhost:5173"
      : "https://staging-portal.collabproject.web.id")
  );
}

function apiBaseUrl() {
  const configured = import.meta.env.VITE_SSO_API_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:3000/api/v1";
  throw new Error("SSO API URL is not configured for this deployment.");
}

export async function createPortalLaunchUrl(returnTo) {
  const codeVerifier = randomValue(48);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier),
  );
  const codeChallenge = base64Url(new Uint8Array(digest));
  const state = randomValue(24);

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      appId: APP_ID,
      codeVerifier,
      state,
      returnTo: safeReturnTo(returnTo),
      createdAt: Date.now(),
    }),
  );

  const url = new URL("/launch", portalUrl());
  url.searchParams.set("app", APP_ID);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("state", state);
  return url.toString();
}

function loadSession(state) {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) throw new Error("The SSO session was not found. Start again.");

  let session;
  try {
    session = JSON.parse(raw);
  } catch {
    throw new Error("The SSO session is invalid. Start again.");
  }

  if (
    session.appId !== APP_ID ||
    session.state !== state ||
    !STATE_PATTERN.test(session.state) ||
    typeof session.codeVerifier !== "string" ||
    Date.now() - session.createdAt > SESSION_TTL_MS
  ) {
    throw new Error("The SSO session is invalid or expired. Start again.");
  }
  return session;
}

export async function completeSso(firebaseAuth, search) {
  const params = new URLSearchParams(search);
  const code = params.get("code");
  const state = params.get("state");
  if (
    !code ||
    !CODE_PATTERN.test(code) ||
    !state ||
    !STATE_PATTERN.test(state)
  ) {
    throw new Error("The one-time SSO response is incomplete.");
  }

  const session = loadSession(state);
  const response = await fetch(`${apiBaseUrl()}/sso/exchange`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appId: APP_ID,
      code,
      codeVerifier: session.codeVerifier,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload.customToken !== "string") {
    throw new Error(
      typeof payload.message === "string"
        ? payload.message
        : "The SSO exchange could not be completed.",
    );
  }

  await setPersistence(firebaseAuth, browserSessionPersistence);
  const credential = await signInWithCustomToken(
    firebaseAuth,
    payload.customToken,
  );
  const token = await credential.user.getIdTokenResult(true);
  if (token.claims.portalAccess !== true || token.claims.appId !== APP_ID) {
    await signOut(firebaseAuth);
    throw new Error("The application token has invalid access claims.");
  }

  sessionStorage.removeItem(SESSION_KEY);
  return safeReturnTo(session.returnTo);
}
