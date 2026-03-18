import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Seo from "../components/common/Seo";
import api from "../utils/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pageNotice, setPageNotice] = useState("");
  const [resetLink, setResetLink] = useState("");
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Email is required");
      return;
    }

    setSubmitting(true);
    setPageNotice("");
    setResetLink("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email: normalizedEmail });
      toast.success(data.message || "Reset email sent");
      if (data.resetLink) {
        setPageNotice(data.message || "Open the direct reset link below.");
        setResetLink(data.resetLink);
        return;
      }
      navigate("/auth");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Backend is unavailable on http://localhost:5000. Start the API server, then try again.";
      setPageNotice(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-shell py-10">
      <Seo title="Forgot Password" description="Request a Celestia password reset email." path="/forgot-password" noindex />
      <div className="mx-auto max-w-xl glass-panel p-8">
        <h1 className="section-title text-center">Forgot your password?</h1>
        <p className="mt-3 text-center text-sm text-ink/65 dark:text-pearl/65">
          Enter your email address and we will send you a password reset link.
        </p>

        {pageNotice ? (
          <div className="mt-4 rounded-3xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
            {pageNotice}
          </div>
        ) : null}

        {resetLink ? (
          <div className="mt-4 rounded-[24px] border border-white/15 bg-white/25 p-4 dark:bg-white/5">
            <p className="text-sm text-ink/70 dark:text-pearl/70">
              Local development fallback is active because SMTP email is not configured yet.
            </p>
            <button
              type="button"
              onClick={() => navigate(resetLink.replace(`${window.location.origin}`, ""))}
              className="btn-primary mt-4 w-full"
            >
              Open reset page
            </button>
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            placeholder="Email address"
            value={email}
            className="glass-panel w-full px-4 py-3 outline-none"
            onChange={(event) => setEmail(event.target.value)}
          />
          <button className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Sending..." : "Send reset email"}
          </button>
          <button type="button" onClick={() => navigate("/auth")} className="btn-secondary w-full">
            Back to login
          </button>
        </form>
      </div>
    </section>
  );
}
