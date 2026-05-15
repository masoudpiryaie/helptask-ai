"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useAuthStore } from "lib/stores/auth-store";
import {
  connectGmail,
  connectGmailByRedirect,
  connectGoogleCalendar,
  connectGoogleCalendarByRedirect,
  getFirebaseErrorCode,
  signInWithGoogle,
  signInWithGoogleByRedirect,
  signOutUser,
} from "lib/firebase/auth-service";
import { useUiStore } from "lib/stores/ui-store";

function getUserName(user: ReturnType<typeof useAuthStore.getState>["user"]) {
  if (!user) return "Guest user";
  if (user.displayName) return user.displayName;
  if (user.email) return user.email;

  return "Guest user";
}

export function AccountScreen() {
  const user = useAuthStore((state) => state.user);

  const googleAccessToken = useAuthStore((state) => state.googleAccessToken);
  const setGoogleAccessToken = useAuthStore(
    (state) => state.setGoogleAccessToken,
  );

  const isCalendarConnected = useAuthStore(
    (state) => state.isCalendarConnected,
  );
  const setIsCalendarConnected = useAuthStore(
    (state) => state.setIsCalendarConnected,
  );

  const isGmailConnected = useAuthStore((state) => state.isGmailConnected);
  const setIsGmailConnected = useAuthStore(
    (state) => state.setIsGmailConnected,
  );

  const showToast = useUiStore((state) => state.showToast);

  const [isLoading, setIsLoading] = useState(false);
  const isAnonymous = Boolean(user?.isAnonymous);

  async function handleGoogleLogin() {
    setIsLoading(true);

    try {
      const result = await signInWithGoogle();

      if (result.accessToken) {
        setGoogleAccessToken(result.accessToken);
      }

      showToast({
        type: "success",
        message: "Signed in with Google.",
      });
    } catch (error) {
      console.error("Google sign-in error:", error);

      const errorCode = getFirebaseErrorCode(error);

      if (errorCode === "auth/popup-blocked") {
        await signInWithGoogleByRedirect();
        return;
      }

      showToast({
        type: "error",
        message: errorCode || "Could not sign in with Google.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnectCalendar() {
    setIsLoading(true);

    try {
      const result = await connectGoogleCalendar();

      if (result.accessToken) {
        setGoogleAccessToken(result.accessToken);
        setIsCalendarConnected(true);

        showToast({
          type: "success",
          message: "Google Calendar connected.",
        });
      } else {
        showToast({
          type: "error",
          message: "Calendar connected, but no access token was returned.",
        });
      }
    } catch (error) {
      console.error("Connect calendar error:", error);

      const errorCode = getFirebaseErrorCode(error);

      if (errorCode === "auth/popup-blocked") {
        await connectGoogleCalendarByRedirect();
        return;
      }

      showToast({
        type: "error",
        message: errorCode || "Could not connect Google Calendar.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnectGmail() {
    setIsLoading(true);

    try {
      const result = await connectGmail();

      if (result.accessToken) {
        setGoogleAccessToken(result.accessToken);
        setIsGmailConnected(true);

        showToast({
          type: "success",
          message: "Gmail connected.",
        });
      } else {
        showToast({
          type: "error",
          message: "Gmail connected, but no access token was returned.",
        });
      }
    } catch (error) {
      console.error("Connect Gmail error:", error);

      const errorCode = getFirebaseErrorCode(error);

      if (errorCode === "auth/popup-blocked") {
        await connectGmailByRedirect();
        return;
      }

      showToast({
        type: "error",
        message: errorCode || "Could not connect Gmail.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignOut() {
    setIsLoading(true);

    try {
      await signOutUser();

      setGoogleAccessToken(null);
      setIsCalendarConnected(false);
      setIsGmailConnected(false);

      showToast({
        type: "info",
        message: "Signed out. You can continue as a guest.",
      });
    } catch (error) {
      console.error("Sign out error:", error);

      showToast({
        type: "error",
        message: "Could not sign out. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="px-5 pb-28 pt-6 text-[#1F2937]">
      <header className="mb-6">
        <Link
          href="/"
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-sm"
          aria-label="Back to today"
        >
          <ArrowLeft size={20} />
        </Link>

        <p className="text-sm font-medium text-[#4F8DFD]">MindTask AI</p>

        <h1 className="mt-1 text-[32px] font-bold tracking-[-0.03em]">
          Account
        </h1>

        <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">
          Keep your tasks and progress connected.
        </p>
      </header>

      <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-[#EAF3FF]">
            <UserRound size={26} className="text-[#4F8DFD]" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold">{getUserName(user)}</h2>

            <p className="mt-1 text-sm leading-6 text-[#6B7280]">
              {isAnonymous
                ? "You are using MindTask AI as a guest."
                : "Your account is connected with Google."}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#F8FAFC] p-4">
          <div className="flex gap-3">
            <ShieldCheck size={19} className="mt-0.5 text-[#64C59A]" />

            <p className="text-sm leading-6 text-[#6B7280]">
              {isAnonymous
                ? "Connect Google to keep your data safer across devices."
                : "Your tasks, plans, and progress are saved in your account."}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3">
        {isAnonymous ? (
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#4F8DFD] px-5 py-4 text-[15px] font-semibold text-white shadow-sm disabled:opacity-60"
          >
            <Sparkles size={18} />
            {isLoading ? "Connecting..." : "Connect with Google"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 text-[15px] font-semibold text-[#1F2937] shadow-sm disabled:opacity-60"
            >
              <Sparkles size={18} className="text-[#4F8DFD]" />
              {isLoading ? "Checking..." : "Switch Google account"}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-[15px] font-semibold text-red-500 shadow-sm disabled:opacity-60"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </>
        )}
      </section>

      <section className="mt-5 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF]">
            <CalendarDays size={22} className="text-[#4F8DFD]" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">Google Calendar</h2>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              {isCalendarConnected
                ? "Calendar is connected. You can import events as fixed tasks."
                : "Connect Calendar to turn classes, meetings, and appointments into tasks."}
            </p>

            <button
              type="button"
              onClick={handleConnectCalendar}
              disabled={isLoading}
              className="mt-4 w-full rounded-2xl bg-[#4F8DFD] px-5 py-4 text-[15px] font-semibold text-white shadow-sm disabled:opacity-60"
            >
              {isCalendarConnected ? "Reconnect Calendar" : "Connect Calendar"}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF]">
            <Mail size={22} className="text-[#4F8DFD]" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">Gmail</h2>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              {isGmailConnected
                ? "Gmail is connected. You can send AI-assisted email drafts."
                : "Connect Gmail to send email drafts after you review them."}
            </p>

            <button
              type="button"
              onClick={handleConnectGmail}
              disabled={isLoading}
              className="mt-4 w-full rounded-2xl bg-[#4F8DFD] px-5 py-4 text-[15px] font-semibold text-white shadow-sm disabled:opacity-60"
            >
              {isGmailConnected ? "Reconnect Gmail" : "Connect Gmail"}
            </button>

            {googleAccessToken ? (
              <p className="mt-3 text-xs leading-5 text-[#6B7280]">
                Google access is active for this session.
              </p>
            ) : (
              <p className="mt-3 text-xs leading-5 text-[#6B7280]">
                You may need to reconnect after refreshing the page.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
