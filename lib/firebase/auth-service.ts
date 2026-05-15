import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
  type UserCredential,
} from "firebase/auth";
import { firebaseAuth } from "lib/firebase/firebase-client";

type AuthResult = {
  user: User;
  accessToken: string | null;
};

export type GoogleConnectionType = "google" | "calendar" | "gmail";

const PENDING_GOOGLE_CONNECTION_KEY = "mindtask-pending-google-connection";

function createGoogleProvider(scopes: string[] = []) {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  scopes.forEach((scope) => {
    provider.addScope(scope);
  });

  return provider;
}

function getGoogleAccessToken(result: UserCredential) {
  const credential = GoogleAuthProvider.credentialFromResult(result);

  return credential?.accessToken || null;
}

export function getFirebaseErrorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: string }).code === "string"
  ) {
    return (error as { code: string }).code;
  }

  return null;
}

function setPendingGoogleConnection(type: GoogleConnectionType) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(PENDING_GOOGLE_CONNECTION_KEY, type);
}

export function getPendingGoogleConnection() {
  if (typeof window === "undefined") return null;

  return window.sessionStorage.getItem(
    PENDING_GOOGLE_CONNECTION_KEY,
  ) as GoogleConnectionType | null;
}

export function clearPendingGoogleConnection() {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(PENDING_GOOGLE_CONNECTION_KEY);
}

async function signInWithGoogleProvider(
  scopes: string[] = [],
): Promise<AuthResult> {
  const provider = createGoogleProvider(scopes);
  const result = await signInWithPopup(firebaseAuth, provider);

  return {
    user: result.user,
    accessToken: getGoogleAccessToken(result),
  };
}

async function redirectWithGoogleProvider(
  type: GoogleConnectionType,
  scopes: string[] = [],
) {
  const provider = createGoogleProvider(scopes);

  setPendingGoogleConnection(type);

  await signInWithRedirect(firebaseAuth, provider);
}

export async function signInWithGoogle() {
  return signInWithGoogleProvider();
}

export async function signInWithGoogleByRedirect() {
  await redirectWithGoogleProvider("google");
}

export async function connectGoogleCalendar() {
  return signInWithGoogleProvider([
    "https://www.googleapis.com/auth/calendar.readonly",
  ]);
}

export async function connectGoogleCalendarByRedirect() {
  await redirectWithGoogleProvider("calendar", [
    "https://www.googleapis.com/auth/calendar.readonly",
  ]);
}

export async function connectGmail() {
  return signInWithGoogleProvider([
    "https://www.googleapis.com/auth/gmail.send",
  ]);
}

export async function connectGmailByRedirect() {
  await redirectWithGoogleProvider("gmail", [
    "https://www.googleapis.com/auth/gmail.send",
  ]);
}

export async function getGoogleRedirectResult() {
  const result = await getRedirectResult(firebaseAuth);

  if (!result) return null;

  return {
    user: result.user,
    accessToken: getGoogleAccessToken(result),
  };
}

export async function signOutUser() {
  clearPendingGoogleConnection();
  await signOut(firebaseAuth);
}
