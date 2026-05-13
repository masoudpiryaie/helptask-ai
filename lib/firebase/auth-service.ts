import {
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "lib/firebase/firebase-client";

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export async function signInWithGoogle() {
  const credential = await signInWithPopup(firebaseAuth, googleProvider);

  return credential.user;
}

export async function linkAnonymousUserWithGoogle(user: User) {
  const credential = await linkWithPopup(user, googleProvider);

  return credential.user;
}

export async function signOutUser() {
  await signOut(firebaseAuth);
}
