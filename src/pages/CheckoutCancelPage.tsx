import { useNavigate } from "react-router-dom";
import "../styles/CheckoutPages.css";

export default function CheckoutCancelPage() {
  const navigate = useNavigate();

  return (
    <main className="checkout-result">
      <div className="checkout-result__icon" aria-hidden="true">😕</div>
      <h1 className="checkout-result__title">Payment cancelled</h1>
      <p className="checkout-result__message">
        Your payment was not completed. No charges were made. Your cart is still
        waiting for you whenever you're ready.
      </p>
      <button className="checkout-result__btn" onClick={() => navigate("/cart")}>
        Return to cart
      </button>
      <br />
      <button className="checkout-result__secondary-btn" onClick={() => navigate("/")}>
        Continue shopping
      </button>
    </main>
  );
}
