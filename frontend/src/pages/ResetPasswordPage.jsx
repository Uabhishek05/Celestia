import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Seo from "../components/common/Seo";
import api from "../utils/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  const linkReady = useMemo(() => Boolean(email && token), [email, token]);

  useEffect(() => {
    let ignore = false;

    async function verifyLink() {
      if (!linkReady) {
        setVerifying(false);
        setVerified(false);
        setVerificationMessage("This reset link is incomplete. Open the latest password reset email and try again.");
        return;
      }

      try {
        const { data } = await api.post("/auth/reset-password/verify", { email, token });
        if (!ignore) {
          setVerified(true);
          setVerificationMessage(
            data.message || "Secure reset link verified. You can now choose a new password."
          );
        }
      } catch (error) {
        if (!ignore) {
          setVerified(false);
          setVerificationMessage(error.response?.data?.message || "Unable to verify reset link");
        }
      } finally {
        if (!ignore) {
          setVerifying(false);
        }
      }
    }

    verifyLink();

    return () => {
      ignore = true;
    };
  }, [email, linkReady, token]);

  const submit = async (event) => {
    event.preventDefault();

    if (!verified) {
      toast.error("Reset link must be verified before updating the password.");
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < 8 || !hasUppercase || !hasLowercase || !hasNumber) {
      toast.error("Use at least 8 characters with uppercase, lowercase, and a number");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/reset-password", {
        email,
        token,
        password
      });
      toast.success(data.message || "Password updated successfully");
      navigate("/auth");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-shell py-10">
      <Seo title="Reset Password" description="Set a new password for your Celestia account." />
      <div className="mx-auto max-w-xl glass-panel p-8">
        <h1 className="section-title text-center">Reset your password</h1>
        <p className="mt-3 text-center text-sm text-ink/65 dark:text-pearl/65">
          Choose a new password for {email || "your account"}.
        </p>

        <div
          className={`mt-6 rounded-3xl px-4 py-3 text-sm ${
            verified
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
              : "border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100"
          }`}
        >
          {verifying ? "Verifying secure reset link..." : verificationMessage}
        </div>

        {verified ? (
          <div className="mt-4 rounded-[24px] border border-white/15 bg-white/25 p-4 text-sm text-ink/70 dark:bg-white/5 dark:text-pearl/70">
            This page is protected by your one-time reset token from the email link. The token expires after 30 minutes and is cleared once the password is changed.
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="glass-panel flex items-center gap-3 px-4 py-3">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              className="w-full bg-transparent outline-none"
              disabled={!verified || verifying}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="rounded-full p-2 text-clay transition hover:bg-white/20 hover:text-wine dark:text-pearl/70 dark:hover:bg-white/10 dark:hover:text-pearl"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="glass-panel flex items-center gap-3 px-4 py-3">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              className="w-full bg-transparent outline-none"
              disabled={!verified || verifying}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="rounded-full p-2 text-clay transition hover:bg-white/20 hover:text-wine dark:text-pearl/70 dark:hover:bg-white/10 dark:hover:text-pearl"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <p className="text-xs text-ink/60 dark:text-pearl/60">
            Password must include at least 8 characters, one uppercase letter, one lowercase letter, and one number.
          </p>

          <button className="btn-primary w-full" disabled={submitting || !verified || verifying}>
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </section>
  );
}
