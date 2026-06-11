import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrder } from "../api/orders";
import { createCheckout } from "../api/payments";
import type { AddressDto } from "../generated/models";
import "../styles/CheckoutPage.css";

const EMPTY_ADDRESS: AddressDto = {
  firstName: "",
  lastName: "",
  company: "",
  street: "",
  addressLine2: "",
  area: "",
  postalCode: "",
  country: "",
  phone: "",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearItems } = useCart();
  const { user } = useAuth();

  const [shipping, setShipping] = useState<AddressDto>({ ...EMPTY_ADDRESS });
  const [billing, setBilling] = useState<AddressDto>({ ...EMPTY_ADDRESS });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("NOK");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    navigate("/", { replace: true });
    return null;
  }

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-page__empty">
          <p>Your cart is empty.</p>
          <button className="checkout-page__back-btn" onClick={() => navigate("/")}>
            Continue shopping
          </button>
        </div>
      </main>
    );
  }

  function updateShipping(field: keyof AddressDto, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  function updateBilling(field: keyof AddressDto, value: string) {
    setBilling((prev) => ({ ...prev, [field]: value }));
  }

  function validateAddress(addr: AddressDto, label: string): string | null {
    if (!addr.firstName?.trim()) return `${label}: First name is required.`;
    if (!addr.lastName?.trim()) return `${label}: Last name is required.`;
    if (!addr.street?.trim()) return `${label}: Street is required.`;
    if (!addr.postalCode?.trim()) return `${label}: Postal code is required.`;
    if (!addr.country?.trim()) return `${label}: Country is required.`;
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const shippingErr = validateAddress(shipping, "Shipping address");
    if (shippingErr) { setError(shippingErr); return; }

    const effectiveBilling = sameAsShipping ? shipping : billing;
    if (!sameAsShipping) {
      const billingErr = validateAddress(effectiveBilling, "Billing address");
      if (billingErr) { setError(billingErr); return; }
    }

    setLoading(true);
    try {
      const order = await placeOrder({
        items: items.map((item) => ({ articleId: item.articleId!, quantity: item.quantity! })),
        shippingAddress: shipping,
        billingAddress: effectiveBilling,
        shippingMethod,
        notes: notes.trim() || undefined,
        currency,
      });
      if (!order?.id) throw new Error("Order creation failed.");
      const session = await createCheckout(order.id);
      if (!session?.sessionUrl) throw new Error("Could not create payment session.");
      clearItems();
      window.location.href = session.sessionUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Checkout failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <main className="checkout-page">
      <button className="checkout-page__back-btn" onClick={() => navigate("/cart")}>
        ← Back to Cart
      </button>

      <h1 className="checkout-page__title">Checkout</h1>

      <div className="checkout-page__layout">
        <form className="checkout-page__form" onSubmit={handleSubmit} noValidate>

          <section className="checkout-section">
            <h2 className="checkout-section__title">Shipping Address</h2>
            <AddressForm prefix="shipping" address={shipping} onChange={updateShipping} disabled={loading} />
          </section>

          <section className="checkout-section">
            <h2 className="checkout-section__title">Billing Address</h2>
            <label className="checkout-page__same-as-shipping">
              <input
                type="checkbox"
                checked={sameAsShipping}
                onChange={(e) => setSameAsShipping(e.target.checked)}
                disabled={loading}
              />
              Same as shipping address
            </label>
            {!sameAsShipping && (
              <AddressForm prefix="billing" address={billing} onChange={updateBilling} disabled={loading} />
            )}
          </section>

          <section className="checkout-section">
            <h2 className="checkout-section__title">Shipping &amp; Payment</h2>

            <div className="checkout-field">
              <label className="checkout-field__label" htmlFor="shipping-method">
                Shipping Method
              </label>
              <select
                id="shipping-method"
                className="checkout-field__input"
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
                disabled={loading}
              >
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="overnight">Overnight</option>
              </select>
            </div>

            <div className="checkout-field">
              <label className="checkout-field__label" htmlFor="currency">
                Currency
              </label>
              <select
                id="currency"
                className="checkout-field__input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={loading}
              >
                <option value="NOK">NOK</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div className="checkout-field">
              <label className="checkout-field__label" htmlFor="notes">
                Order Notes (optional)
              </label>
              <textarea
                id="notes"
                className="checkout-field__input checkout-field__input--textarea"
                rows={3}
                placeholder="Any special instructions…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
              />
            </div>
          </section>

          {error && <p className="checkout-page__error">{error}</p>}

          <button className="checkout-page__submit-btn" type="submit" disabled={loading}>
            {loading ? "Processing…" : "Place Order & Pay"}
          </button>
        </form>

        <aside className="checkout-page__summary">
          <h2 className="checkout-summary__title">Order Summary</h2>
          <ul className="checkout-summary__list">
            {items.map((item) => (
              <li key={item.articleId} className="checkout-summary__item">
                <span className="checkout-summary__item-name">
                  {item.articleName ?? "Product"}
                  <span className="checkout-summary__item-qty"> × {item.quantity}</span>
                </span>
                <span className="checkout-summary__item-price">
                  {item.lineTotal != null ? `${item.lineTotal.toFixed(2)} ${currency}` : "—"}
                </span>
              </li>
            ))}
          </ul>
          <div className="checkout-summary__total">
            <span>Total</span>
            <strong>{totalPrice.toFixed(2)} {currency}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

interface AddressFormProps {
  prefix: string;
  address: AddressDto;
  onChange: (field: keyof AddressDto, value: string) => void;
  disabled: boolean;
}

function AddressForm({ prefix, address, onChange, disabled }: AddressFormProps) {
  const field = (name: keyof AddressDto, label: string, placeholder = "", required = false) => (
    <div className="checkout-field" key={name}>
      <label className="checkout-field__label" htmlFor={`${prefix}-${name}`}>
        {label}{required && <span className="checkout-field__required"> *</span>}
      </label>
      <input
        id={`${prefix}-${name}`}
        className="checkout-field__input"
        type="text"
        placeholder={placeholder}
        value={(address[name] as string) ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
      />
    </div>
  );

  return (
    <div className="checkout-address-form">
      <div className="checkout-address-form__row">
        {field("firstName", "First Name", "John", true)}
        {field("lastName", "Last Name", "Doe", true)}
      </div>
      {field("company", "Company", "Acme Inc. (optional)")}
      {field("street", "Street Address", "123 Main St", true)}
      {field("addressLine2", "Address Line 2", "Apt 4B (optional)")}
      <div className="checkout-address-form__row">
        {field("area", "City / Area", "Oslo")}
        {field("postalCode", "Postal Code", "0150", true)}
      </div>
      {field("country", "Country", "Norway", true)}
      {field("phone", "Phone", "+47 123 45 678")}
    </div>
  );
}
