import {
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "lib/firebase/firebase-client";

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

function getGoogleAccessToken(
  result: Awaited<ReturnType<typeof signInWithPopup>>,
) {
  const credential = GoogleAuthProvider.credentialFromResult(result);

  return credential?.accessToken || null;
}

export async function signInWithGoogle() {
  const provider = createGoogleProvider();
  const result = await signInWithPopup(firebaseAuth, provider);

  return {
    user: result.user,
    accessToken: getGoogleAccessToken(result),
  };
}

export async function linkAnonymousUserWithGoogle(user: User) {
  const provider = createGoogleProvider();
  const result = await linkWithPopup(user, provider);

  const credential = GoogleAuthProvider.credentialFromResult(result);

  return {
    user: result.user,
    accessToken: credential?.accessToken || null,
  };
}

export async function connectGoogleCalendar(user: User | null) {
  const provider = createGoogleProvider([
    "https://www.googleapis.com/auth/calendar.readonly",
  ]);

  if (user?.isAnonymous) {
    const result = await linkWithPopup(user, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    return {
      user: result.user,
      accessToken: credential?.accessToken || null,
    };
  }

  const result = await signInWithPopup(firebaseAuth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);

  return {
    user: result.user,
    accessToken: credential?.accessToken || null,
  };
}

export async function signOutUser() {
  await signOut(firebaseAuth);
}

export async function connectGmail(user: User | null) {
  const provider = createGoogleProvider([
    "https://www.googleapis.com/auth/gmail.send",
  ]);

  if (user?.isAnonymous) {
    const result = await linkWithPopup(user, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    return {
      user: result.user,
      accessToken: credential?.accessToken || null,
    };
  }

  const result = await signInWithPopup(firebaseAuth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);

  return {
    user: result.user,
    accessToken: credential?.accessToken || null,
  };
}
