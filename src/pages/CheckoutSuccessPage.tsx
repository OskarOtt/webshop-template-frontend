import { useNavigate } from "react-router-dom";
import "../styles/CheckoutPages.css";

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();

  return (
    <main className="checkout-result">
      <div className="checkout-result__icon" aria-hidden="true">🎉</div>
      <h1 className="checkout-result__title">Payment successful!</h1>
      <p className="checkout-result__message">
        Thank you for your order. Your payment has been received and your order
        is being processed. You'll find the details in your order history.
      </p>
      <button className="checkout-result__btn" onClick={() => navigate("/orders")}>
        View my orders
      </button>
      <br />
      <button className="checkout-result__secondary-btn" onClick={() => navigate("/")}>
        Continue shopping
      </button>
    </main>
  );
}
