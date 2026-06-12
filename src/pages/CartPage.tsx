import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import "../styles/CartPage.css";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, itemCount, totalPrice, updateQuantity, removeItem, clearItems, loading } = useCart();
  const { user } = useAuth();
  const { openLoginModal } = useUI();

  if (loading) return <p className="cart-page__status">Loading cart…</p>;

  return (
    <main className="cart-page">
      <div className="cart-page__header">
        <h1 className="cart-page__title">Shopping Cart</h1>
        {itemCount > 0 && (
          <button className="cart-page__clear-btn" onClick={clearItems}>
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="cart-page__empty">
          <p>Your cart is empty.</p>
          <button className="cart-page__shop-btn" onClick={() => navigate("/")}>
            Continue shopping
          </button>
        </div>
      ) : (
        <>
          <ul className="cart-page__list">
            {items.map((item) => (
              <li key={item.articleId} className="cart-item">
                <div className="cart-item__image-wrapper">
                  {item.mainImageUrl ? (
                    <img className="cart-item__image" src={item.mainImageUrl} alt={item.articleName ?? "Product"} />
                  ) : (
                    <div className="cart-item__image-placeholder" aria-hidden="true" />
                  )}
                </div>

                <div className="cart-item__info">
                  <p
                    className="cart-item__name"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/articles/${item.articleId}`)}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/articles/${item.articleId}`)}
                  >
                    {item.articleName ?? "Product"}
                  </p>
                  <p className="cart-item__unit-price">
                    {item.unitPrice != null ? `${item.unitPrice.toFixed(2)} kr` : "—"} each
                  </p>
                </div>

                <div className="cart-item__qty">
                  <button
                    className="cart-item__qty-btn"
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(item.articleId!, (item.quantity ?? 1) - 1)}
                  >
                    −
                  </button>
                  <span className="cart-item__qty-value">{item.quantity}</span>
                  <button
                    className="cart-item__qty-btn"
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(item.articleId!, (item.quantity ?? 1) + 1)}
                  >
                    +
                  </button>
                </div>

                <p className="cart-item__line-total">
                  {item.lineTotal != null ? `${item.lineTotal.toFixed(2)} kr` : "—"}
                </p>

                <button
                  className="cart-item__remove-btn"
                  aria-label={`Remove ${item.articleName}`}
                  onClick={() => removeItem(item.articleId!)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-page__summary">
            <p className="cart-page__total">
              Total: <strong>{totalPrice.toFixed(2)} kr</strong>
            </p>

            {!user ? (
              <p className="cart-page__login-prompt">
                Please{" "}
                <button
                  className="cart-page__login-link"
                  onClick={openLoginModal}
                >
                  log in
                </button>{" "}
                to proceed to checkout.
              </p>
            ) : (
              <button
                className="cart-page__checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            )}
          </div>
        </>
      )}
    </main>
  );
}
