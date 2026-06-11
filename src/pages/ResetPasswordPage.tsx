import { useState, type FormEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth";
import "../styles/ResetPasswordPage.css";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err: unknown) {
      const status = getStatus(err);
      if (status === 401) {
        setError("This reset link is invalid, expired, or has already been used. Please request a new one.");
      } else {
        setError(extractMessage(err) ?? "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="reset-page">
        <div className="reset-page__card">
          <h1 className="reset-page__title">Invalid link</h1>
          <p className="reset-page__text">This reset link is missing a token. Please request a new password reset.</p>
          <button className="reset-page__btn" onClick={() => navigate("/")}>Go to home</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-page">
        <div className="reset-page__card">
          <h1 className="reset-page__title">Password updated</h1>
          <p className="reset-page__text">Your password has been reset successfully. You can now log in with your new password.</p>
          <button className="reset-page__btn" onClick={() => navigate("/")}>Go to home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <div className="reset-page__card">
        <h1 className="reset-page__title">Reset password</h1>
        <p className="reset-page__text">Enter your new password below.</p>
        <form className="reset-page__form" onSubmit={handleSubmit}>
          <label className="reset-page__label">
            New password
            <input
              className="reset-page__input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              autoFocus
              minLength={8}
            />
          </label>
          <label className="reset-page__label">
            Confirm new password
            <input
              className="reset-page__input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
          {error && <p className="reset-page__error">{error}</p>}
          <button className="reset-page__btn" type="submit" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function getStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "status" in err) {
    return (err as { status: number }).status;
  }
  return undefined;
}

function extractMessage(err: unknown): string | undefined {
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return undefined;
}
