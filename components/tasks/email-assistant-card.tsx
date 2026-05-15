"use client";

import { useState } from "react";
import { Mail, Send, Sparkles, Save, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Task } from "types/task";
import { useAuthStore } from "lib/stores/auth-store";
import { useUiStore } from "lib/stores/ui-store";
import { generateEmailDraft } from "lib/ai/generate-email-draft";
import { sendGmailMessage } from "lib/google/send-gmail-message";
import { updateEmailDraftInFirestore } from "lib/firebase/task-service";
import { AiLoadingLogo } from "components/ui/ai-loading-logo";

type EmailAssistantCardProps = {
  task: Task;
};

export function EmailAssistantCard({ task }: EmailAssistantCardProps) {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const googleAccessToken = useAuthStore((state) => state.googleAccessToken);
  const isGmailConnected = useAuthStore((state) => state.isGmailConnected);

  const showToast = useUiStore((state) => state.showToast);

  const [recipientEmail, setRecipientEmail] = useState(
    task.recipientEmail || "",
  );
  const [context, setContext] = useState("");
  const [emailSubject, setEmailSubject] = useState(task.emailSubject || "");
  const [emailDraft, setEmailDraft] = useState(task.emailDraft || "");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function handleGenerateDraft() {
    if (!user) {
      showToast({
        type: "error",
        message: "Please wait a moment and try again.",
      });
      return;
    }

    if (!context.trim()) {
      showToast({
        type: "info",
        message: "Add a short context first.",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateEmailDraft({
        taskTitle: task.title,
        recipientEmail,
        context,
        tone: "professional",
      });

      setEmailSubject(result.draft.subject);
      setEmailDraft(result.draft.body);

      await updateEmailDraftInFirestore(user.uid, task.id, {
        recipientEmail,
        emailSubject: result.draft.subject,
        emailDraft: result.draft.body,
      });

      showToast({
        type: result.usedFallback ? "info" : "success",
        message: result.usedFallback
          ? "I made a simple draft you can edit."
          : "AI draft is ready to review.",
      });
    } catch (error) {
      console.error("Generate email draft error:", error);

      showToast({
        type: "error",
        message: "Could not generate email draft.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveDraft() {
    if (!user) {
      showToast({
        type: "error",
        message: "Please wait a moment and try again.",
      });
      return;
    }

    setIsSavingDraft(true);

    try {
      await updateEmailDraftInFirestore(user.uid, task.id, {
        recipientEmail,
        emailSubject,
        emailDraft,
      });

      showToast({
        type: "success",
        message: "Email draft saved.",
      });
    } catch (error) {
      console.error("Save email draft error:", error);

      showToast({
        type: "error",
        message: "Could not save email draft.",
      });
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleSendEmail() {
    if (!user) {
      showToast({
        type: "error",
        message: "Please wait a moment and try again.",
      });
      return;
    }

    if (!isGmailConnected || !googleAccessToken) {
      showToast({
        type: "info",
        message: "Please connect Gmail first.",
      });

      router.push("/account");
      return;
    }

    if (!recipientEmail.trim() || !emailSubject.trim() || !emailDraft.trim()) {
      showToast({
        type: "info",
        message: "Please complete recipient, subject, and body first.",
      });
      return;
    }

    setIsSending(true);

    try {
      await sendGmailMessage({
        accessToken: googleAccessToken,
        to: recipientEmail,
        subject: emailSubject,
        body: emailDraft,
      });

      await updateEmailDraftInFirestore(user.uid, task.id, {
        recipientEmail,
        emailSubject,
        emailDraft,
      });

      showToast({
        type: "success",
        message: "Email sent.",
      });
    } catch (error) {
      console.error("Send email error:", error);

      showToast({
        type: "error",
        message: "Could not send email. Please reconnect Gmail and try again.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="mt-4 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF]">
          <Mail size={20} className="text-[#4F8DFD]" />
        </div>

        <div>
          <h2 className="text-[17px] font-semibold">AI Email Assistant</h2>
          <p className="mt-1 text-sm leading-6 text-[#6B7280]">
            Generate a draft, edit it, then send it after review.
          </p>
        </div>
      </div>

      {isGenerating ? (
        <div className="mt-5 rounded-[24px] border border-[#EAF3FF] bg-[#F8FAFC] p-5">
          <AiLoadingLogo
            size="sm"
            label="AI is writing a draft..."
            sublabel="I am keeping it clear, polite, and easy to edit."
          />
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        <div>
          <label className="text-sm font-semibold">Recipient email</label>
          <input
            value={recipientEmail}
            onChange={(event) => setRecipientEmail(event.target.value)}
            placeholder="example@email.com"
            className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-[15px] outline-none transition focus:border-[#4F8DFD] focus:bg-white"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Email context</label>
          <textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Example: I need to ask my professor if I can submit the assignment two days later."
            rows={4}
            className="mt-2 w-full resize-none rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-[15px] leading-6 outline-none transition focus:border-[#4F8DFD] focus:bg-white"
          />
        </div>

        <button
          type="button"
          onClick={handleGenerateDraft}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#4F8DFD] px-5 py-4 text-[15px] font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Wand2 size={18} />
          {isGenerating ? "Writing..." : "Generate draft"}
        </button>
      </div>

      <div className="mt-5 rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-4">
        <div>
          <label className="text-sm font-semibold">Subject</label>
          <input
            value={emailSubject}
            onChange={(event) => setEmailSubject(event.target.value)}
            placeholder="Email subject"
            className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-[15px] outline-none transition focus:border-[#4F8DFD]"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold">Body</label>
          <textarea
            value={emailDraft}
            onChange={(event) => setEmailDraft(event.target.value)}
            placeholder="Your email draft will appear here."
            rows={8}
            className="mt-2 w-full resize-none rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-[15px] leading-6 outline-none transition focus:border-[#4F8DFD]"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#1F2937] shadow-sm disabled:opacity-60"
          >
            <Save size={17} />
            {isSavingDraft ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            disabled={isSending}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#64C59A] px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
          >
            <Send size={17} />
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>

        {!isGmailConnected ? (
          <p className="mt-3 text-center text-xs leading-5 text-[#6B7280]">
            Gmail is not connected yet. You can connect it from Account before
            sending.
          </p>
        ) : (
          <p className="mt-3 text-center text-xs leading-5 text-[#6B7280]">
            You are always in control. Review before sending.
          </p>
        )}
      </div>
    </section>
  );
}
