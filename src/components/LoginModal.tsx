import { useState, useEffect, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { forgotPassword } from "../api/auth";
import { extractApiErrorMessage, getApiErrorStatus } from "../api/errors";
import "../styles/LoginModal.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "login" | "register" | "forgot";

export default function LoginModal({ open, onClose }: Props) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regEmail, setRegEmail] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setError("");
      setLoading(false);
      setForgotSuccess(false);
      setTab("login");
    }
  }, [open]);

  useEffect(() => {
    setError("");
    setForgotSuccess(false);
  }, [tab]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
      onClose();
    } catch (err: unknown) {
      const status = getApiErrorStatus(err);
      if (status === 401) {
        setError("Incorrect email or password.");
      } else {
        setError(extractApiErrorMessage(err) ?? "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ email: regEmail, firstName: regFirstName, lastName: regLastName, password: regPassword });
      onClose();
    } catch (err: unknown) {
      const status = getApiErrorStatus(err);
      if (status === 409) {
        setError("That email address is already registered. Try logging in instead.");
      } else {
        setError(extractApiErrorMessage(err) ?? "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email: forgotEmail });
      setForgotSuccess(true);
    } catch {
      // Always show success to avoid leaking whether email exists
      setForgotSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const ariaLabel = tab === "login" ? "Log in" : tab === "register" ? "Register" : "Forgot password";

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>

        <div className="modal__tabs">
          <button className={`modal__tab ${tab === "login" ? "modal__tab--active" : ""}`} onClick={() => setTab("login")}>
            Log in
          </button>
          <button className={`modal__tab ${tab === "register" ? "modal__tab--active" : ""}`} onClick={() => setTab("register")}>
            Register
          </button>
        </div>

        {tab === "login" && (
          <form className="modal__form" onSubmit={handleLogin}>
            <label className="modal__label">
              Email
              <input className="modal__input" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required autoComplete="email" autoFocus />
            </label>
            <label className="modal__label">
              Password
              <input className="modal__input" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required autoComplete="current-password" />
            </label>
            {error && <p className="modal__error">{error}</p>}
            <button className="modal__submit" type="submit" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </button>
            <button type="button" className="modal__link" onClick={() => setTab("forgot")}>
              Forgot password?
            </button>
          </form>
        )}

        {tab === "register" && (
          <form className="modal__form" onSubmit={handleRegister}>
            <label className="modal__label">
              First name
              <input className="modal__input" type="text" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required autoComplete="given-name" autoFocus />
            </label>
            <label className="modal__label">
              Last name
              <input className="modal__input" type="text" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} required autoComplete="family-name" />
            </label>
            <label className="modal__label">
              Email
              <input className="modal__input" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required autoComplete="email" />
            </label>
            <label className="modal__label">
              Password
              <input className="modal__input" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required autoComplete="new-password" />
            </label>
            {error && <p className="modal__error">{error}</p>}
            <button className="modal__submit" type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}

        {tab === "forgot" && (
          <form className="modal__form" onSubmit={handleForgotPassword}>
            {forgotSuccess ? (
              <>
                <p className="modal__success">
                  If that email is registered, you'll receive a reset link shortly. (Remember to check your spam folder!)
                </p>
                <button type="button" className="modal__link" onClick={() => setTab("login")}>
                  Back to log in
                </button>
              </>
            ) : (
              <>
                <p className="modal__hint">Enter your email address and we'll send you a link to reset your password.</p>
                <label className="modal__label">
                  Email
                  <input className="modal__input" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required autoComplete="email" autoFocus />
                </label>
                {error && <p className="modal__error">{error}</p>}
                <button className="modal__submit" type="submit" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </button>
                <button type="button" className="modal__link" onClick={() => setTab("login")}>
                  Back to log in
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}


