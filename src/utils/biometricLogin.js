import { saveAuthTokens, refreshAccessTokenIfNeeded, getRefreshToken } from "../utils";

const OPT_IN_KEY = "medfair_biometric_opt_in";
const VAULT_KEY = "medfair_biometric_vault";
const DECLINED_KEY = "medfair_biometric_declined";

function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = "";
  bytes.forEach((b) => {
    str += String.fromCharCode(b);
  });
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBuffer(base64url) {
  const pad = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) buffer[i] = raw.charCodeAt(i);
  return buffer;
}

export function getBiometricPreference() {
  return localStorage.getItem(OPT_IN_KEY) === "true";
}

export function hasDeclinedBiometricPrompt() {
  return localStorage.getItem(DECLINED_KEY) === "true";
}

export function setDeclinedBiometricPrompt() {
  localStorage.setItem(DECLINED_KEY, "true");
}

export function clearBiometricLogin() {
  localStorage.removeItem(OPT_IN_KEY);
  localStorage.removeItem(VAULT_KEY);
}

export async function isBiometricAvailable() {
  if (!window.PublicKeyCredential) return false;
  try {
    if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch {
    return false;
  }
}

export function hasBiometricLoginSetup() {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return false;
    const vault = JSON.parse(raw);
    return Boolean(vault?.credentialId && vault?.email);
  } catch {
    return false;
  }
}

/**
 * After password login: optional fingerprint / Face ID unlock on this device.
 */
export async function enableBiometricLogin({ email, refreshToken, userData }) {
  if (!email || !refreshToken) {
    throw new Error("Sign in with password first to enable biometric login.");
  }

  const available = await isBiometricAvailable();
  if (!available) {
    throw new Error("Biometric login is not available on this device or browser.");
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "MedFair", id: window.location.hostname },
      user: {
        id: userId,
        name: email,
        displayName: email,
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
    },
  });

  if (!credential?.rawId) {
    throw new Error("Could not register biometric login.");
  }

  localStorage.setItem(
    VAULT_KEY,
    JSON.stringify({
      email,
      credentialId: bufferToBase64url(credential.rawId),
      userData,
      refreshToken,
    })
  );
  localStorage.setItem(OPT_IN_KEY, "true");
  localStorage.removeItem(DECLINED_KEY);
}

/**
 * Unlock session using device biometrics + stored refresh token.
 */
export async function loginWithBiometric() {
  const raw = localStorage.getItem(VAULT_KEY);
  if (!raw) throw new Error("Biometric login is not set up on this device.");

  const vault = JSON.parse(raw);
  const credId = base64urlToBuffer(vault.credentialId);
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: credId, type: "public-key" }],
      userVerification: "required",
      timeout: 60000,
    },
  });

  if (!assertion) {
    throw new Error("Biometric verification failed.");
  }

  saveAuthTokens({
    token: null,
    refreshToken: vault.refreshToken || getRefreshToken(),
  });

  const token = await refreshAccessTokenIfNeeded({ force: true });
  if (!token) {
    throw new Error("Session expired. Please sign in with your password once.");
  }

  if (vault.userData) {
    localStorage.setItem("userData", JSON.stringify(vault.userData));
    localStorage.setItem("roleType", vault.userData.role);
  }

  return { userData: vault.userData, email: vault.email };
}
