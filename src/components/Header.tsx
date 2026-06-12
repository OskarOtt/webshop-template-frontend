import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import "../styles/Header.css";

export default function Header() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { openLoginModal } = useUI();
  const navigate = useNavigate();

  function handleProfileClick() {
    if (user) {
      navigate("/profile");
    } else {
      openLoginModal();
    }
  }

  return (
    <header className="header">
        <div className="header__logo" onClick={() => navigate("/")} role="button" tabIndex={0}>
          <div className="header__logo-icon" aria-hidden="true">🛒</div>
          <span className="header__logo-text">ShopApp</span>
        </div>

        <div className="header__actions">
          <button
            className="header__cart-btn"
            onClick={() => navigate("/cart")}
            aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
          >
            <svg className="header__cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {itemCount > 0 && (
              <span className="header__cart-badge" aria-hidden="true">{itemCount}</span>
            )}
          </button>

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
        </div>
      </header>
  );
}
