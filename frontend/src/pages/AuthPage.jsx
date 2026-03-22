import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Seo from "../components/common/Seo";
import { useStore } from "../context/StoreContext";
import api from "../utils/api";

const apiBaseUrl = api.defaults.baseURL || "http://localhost:5000/api";

function loadGoogleScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function AuthPage({ initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [backendNotice, setBackendNotice] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const googleButtonRef = useRef(null);
  const { authenticate } = useStore();
  const navigate = useNavigate();

  async function postAuth(path, payload) {
    try {
      const { data } = await api.post(`/auth${path}`, payload);
      return data;
    } catch (error) {
      const message = error?.response?.data?.message;
      throw new Error(message || `Backend is unreachable on ${apiBaseUrl}. Start the API server and database, then try again.`);
    }
  }

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    let ignore = false;

    async function loadHealth() {
      try {
        const { data } = await api.get("/health");
        if (!ignore) {
          setBackendNotice(
            data.status === "ok"
              ? ""
              : "Backend is running, but the database is offline. Start MongoDB or fix MONGODB_URI before logging in."
          );
        }
      } catch (error) {
        if (!ignore) {
          setBackendNotice(`Backend is offline on ${apiBaseUrl}. Start the backend server before logging in.`);
        }
      }
    }

    loadHealth();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function setupGoogle() {
      if (!googleButtonRef.current) return;

      let clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

      if (!clientId) {
        try {
          const { data } = await api.get("/auth/google-config");
          clientId = data.clientId || "";
        } catch (error) {
          if (!ignore) {
            setGoogleReady(false);
          }
          setGoogleError("Google sign-in is unavailable until the backend is reachable.");
          return;
        }
      }

      if (!clientId) {
        if (!ignore) {
          setGoogleReady(false);
        }
        setGoogleError("Set GOOGLE_CLIENT_ID in the backend to enable Google sign-in.");
        return;
      }

      const loaded = await loadGoogleScript();
      if (!loaded || !window.google?.accounts?.id) {
        if (!ignore) {
          setGoogleReady(false);
        }
        setGoogleError("Google sign-in could not load in this browser session.");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const data = await postAuth("/google", { credential: response.credential });
            authenticate(data);
            toast.success("Logged in with Google");
            navigate(data.user.role === "admin" ? "/admin" : "/profile");
          } catch (error) {
            toast.error(error.message || "Google login failed");
          }
        }
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "icon",
        theme: "outline",
        size: "large",
        shape: "pill"
      });
      if (!ignore) {
        setGoogleReady(true);
      }
      setGoogleError("");
    }

    setupGoogle();

    return () => {
      ignore = true;
    };
  }, [authenticate, mode, navigate]);

  const handleGoogleClick = () => {
    if (!googleReady) {
      toast.error(googleError || "Google sign-in is not ready yet.");
      return;
    }

    const googleButton = googleButtonRef.current?.querySelector("div[role='button'], iframe");
    if (googleButton instanceof HTMLElement) {
      googleButton.click();
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    toast.error("Google sign-in could not open.");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setBackendNotice("");

    try {
      const email = form.email.trim().toLowerCase();
      const password = form.password.trim();
      const payload =
        mode === "login"
          ? { email, password }
          : { name: form.name.trim(), email, password };

      const data = await postAuth(mode === "login" ? "/login" : "/signup", payload);
      authenticate(data);
      toast.success(mode === "login" ? "Logged in" : "Account created");
      navigate(data.user.role === "admin" ? "/admin" : "/profile");
    } catch (error) {
      console.error("Authentication failed", error);
      setBackendNotice(error.message || "Unable to authenticate");
      toast.error(error.message || "Unable to authenticate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchMode = (nextMode) => {
    setMode(nextMode);
    navigate(nextMode === "login" ? "/auth" : "/register");
  };

  const fillAdminCredentials = () => {
    setMode("login");
    navigate("/auth");
    setForm((current) => ({
      ...current,
      email: "admin@celestia.com",
      password: "Admin@12345"
    }));
  };

  return (
    <section className="container-shell py-10">
      <Seo
        title={mode === "login" ? "Login" : "Register"}
        description="Login or create your Celestia Premium account."
        path={mode === "login" ? "/auth" : "/register"}
        noindex
      />
      <div className="mx-auto max-w-xl glass-panel p-8">
        <div className="mx-auto flex w-fit rounded-full border border-white/20 bg-white/40 p-1 dark:bg-white/5">
          <button
            type="button"
            onClick={() => handleSwitchMode("login")}
            className={mode === "login" ? "btn-primary px-6 py-2 text-sm" : "rounded-full px-6 py-2 text-sm"}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode("signup")}
            className={mode === "signup" ? "btn-primary px-6 py-2 text-sm" : "rounded-full px-6 py-2 text-sm"}
          >
            Register
          </button>
        </div>

        <h1 className="section-title mt-6 text-center">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-3 text-center text-sm text-ink/65 dark:text-pearl/65">
          {mode === "login"
            ? "Login with your email or continue with Google."
            : "Register as a customer, or use the seeded admin credentials below."}
        </p>
        {backendNotice ? (
          <div className="mt-4 rounded-3xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
            {backendNotice}
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" ? (
            <input
              placeholder="Full name"
              value={form.name}
              className="glass-panel w-full px-4 py-3 outline-none"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          ) : null}
          <input
            placeholder="Email"
            value={form.email}
            className="glass-panel w-full px-4 py-3 outline-none"
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <div className="glass-panel flex items-center gap-3 px-4 py-3">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              className="w-full bg-transparent outline-none"
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
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
          <button className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
          <div ref={googleButtonRef} className="sr-only" aria-hidden="true" />
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={handleGoogleClick}
              className="inline-flex min-w-[240px] items-center justify-center gap-3 rounded-full border border-white/15 bg-white/20 px-5 py-3 text-sm font-semibold text-wine transition hover:border-wine/25 hover:bg-white/35 dark:bg-white/5 dark:text-pearl dark:hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M21.6 12.23c0-.68-.06-1.33-.18-1.95H12v3.69h5.39a4.62 4.62 0 0 1-2 3.03v2.5h3.24c1.9-1.75 2.97-4.33 2.97-7.27Z"
                />
                <path
                  fill="#34A853"
                  d="M12 22c2.7 0 4.96-.9 6.61-2.45l-3.24-2.5c-.9.6-2.05.96-3.37.96-2.58 0-4.76-1.74-5.54-4.08H3.12v2.58A10 10 0 0 0 12 22Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.46 13.93A5.97 5.97 0 0 1 6.15 12c0-.67.12-1.32.31-1.93V7.49H3.12A10 10 0 0 0 2 12c0 1.61.39 3.14 1.12 4.51l3.34-2.58Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.98c1.47 0 2.8.5 3.84 1.48l2.88-2.88C16.95 2.94 14.7 2 12 2a10 10 0 0 0-8.88 5.49l3.34 2.58C7.24 7.72 9.42 5.98 12 5.98Z"
                />
              </svg>
              <span>{mode === "login" ? "Login with Google" : "Register with Google"}</span>
            </button>
            {googleError ? (
              <p className="mt-3 text-xs text-clay dark:text-pearl/70">{googleError}</p>
            ) : null}
          </div>
        </form>

        <button
          type="button"
          onClick={fillAdminCredentials}
          className="mt-5 block w-full rounded-[24px] border border-white/15 bg-white/30 p-4 text-left text-sm transition hover:border-wine/25 hover:bg-white/40 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <p className="font-semibold text-wine dark:text-pearl">Admin Login</p>
          <p className="mt-2 text-ink/70 dark:text-pearl/70">Email: admin@celestia.com</p>
          <p className="text-ink/70 dark:text-pearl/70">Password: Admin@12345</p>
          <p className="mt-2 text-xs text-clay dark:text-pearl/55">Click to auto-fill admin credentials</p>
        </button>

        <div className="mt-4 flex justify-between text-sm">
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => handleSwitchMode("signup")}
              className="hover:text-wine dark:hover:text-pearl"
            >
              Need an account?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSwitchMode("login")}
              className="hover:text-wine dark:hover:text-pearl"
            >
              Already have an account?
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password
          </button>
        </div>
      </div>
    </section>
  );
}
