import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import "./Header.css";

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  function handleProfileClick() {
    if (user) {
      navigate("/profile");
    } else {
      setModalOpen(true);
    }
  }

  return (
    <>
      <header className="header">
        <div className="header__logo" onClick={() => navigate("/")} role="button" tabIndex={0}>
          <div className="header__logo-icon" aria-hidden="true">🛒</div>
          <span className="header__logo-text">ShopApp</span>
        </div>

        <button className="header__profile-btn" onClick={handleProfileClick} aria-label={user ? "Go to profile" : "Log in"}>
          {user ? (
            <>
              <svg className="header__profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <span className="header__profile-name">
                {user.firstName ?? user.email ?? "Profile"}
              </span>
            </>
          ) : (
            <span className="header__login-text">Log in</span>
          )}
        </button>
      </header>

      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
