import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <main className="profile">
      <div className="profile__card">
        <div className="profile__avatar" aria-hidden="true">
          {(user.firstName ?? user.email ?? "U").charAt(0).toUpperCase()}
        </div>

        <h1 className="profile__username">
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email}
        </h1>

        <dl className="profile__details">
          {user.email && (
            <div className="profile__detail-row">
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
          )}
          {user.phone && (
            <div className="profile__detail-row">
              <dt>Phone</dt>
              <dd>{user.phone}</dd>
            </div>
          )}
        </dl>

        <button
          className="profile__logout-btn"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Log out
        </button>
      </div>
    </main>
  );
}
