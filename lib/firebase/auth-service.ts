import {
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,
  signOut,
  getRedirectResult,
  signInWithRedirect,
  type User,
  type UserCredential,
} from "firebase/auth";
import { firebaseAuth } from "lib/firebase/firebase-client";

type AuthResult = {
  user: User;
  accessToken: string | null;
  linked: boolean;
};

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

function isFirebaseAuthError(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === code
  );
}

async function signInWithGoogleProvider(
  scopes: string[] = [],
): Promise<AuthResult> {
  const provider = createGoogleProvider(scopes);
  const result = await signInWithPopup(firebaseAuth, provider);

  return {
    user: result.user,
    accessToken: getGoogleAccessToken(result),
    linked: false,
  };
}

async function linkOrSignInWithGoogleProvider(
  user: User | null,
  scopes: string[] = [],
): Promise<AuthResult> {
  const provider = createGoogleProvider(scopes);

  if (!user || !user.isAnonymous) {
    const result = await signInWithPopup(firebaseAuth, provider);

    return {
      user: result.user,
      accessToken: getGoogleAccessToken(result),
      linked: false,
    };
  }

  try {
    const result = await linkWithPopup(user, provider);

    return {
      user: result.user,
      accessToken: getGoogleAccessToken(result),
      linked: true,
    };
  } catch (error) {
    if (isFirebaseAuthError(error, "auth/credential-already-in-use")) {
      const result = await signInWithPopup(firebaseAuth, provider);

      return {
        user: result.user,
        accessToken: getGoogleAccessToken(result),
        linked: false,
      };
    }

    throw error;
  }
}

export async function signInWithGoogle() {
  return signInWithGoogleProvider();
}

export async function linkAnonymousUserWithGoogle(user: User) {
  return linkOrSignInWithGoogleProvider(user);
}

export async function connectGoogleCalendar(user: User | null) {
  return linkOrSignInWithGoogleProvider(user, [
    "https://www.googleapis.com/auth/calendar.readonly",
  ]);
}

export async function connectGmail(user: User | null) {
  return linkOrSignInWithGoogleProvider(user, [
    "https://www.googleapis.com/auth/gmail.send",
  ]);
}

export async function signOutUser() {
  await signOut(firebaseAuth);
}
export async function redirectToGoogle(scopes: string[] = []) {
  const provider = createGoogleProvider(scopes);

  await signInWithRedirect(firebaseAuth, provider);
}
export async function redirectToGoogleCalendar() {
  return redirectToGoogle([
    "https://www.googleapis.com/auth/calendar.readonly",
  ]);
}
export async function redirectToGmail() {
  return redirectToGoogle(["https://www.googleapis.com/auth/gmail.send"]);
}
export async function getGoogleRedirectResult() {
  const result = await getRedirectResult(firebaseAuth);

  if (!result) return null;

  return {
    user: result.user,
    accessToken: getGoogleAccessToken(result),
    linked: false,
  };
}
