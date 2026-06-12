import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrder, updateOrderStatus } from "../api/orders";
import type { OrderStatus } from "../api/orders";
import type { OrderResponse, AddressDto } from "../generated/models";
import "../styles/OrderDetailPage.css";

const ALL_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

function formatAddress(addr?: AddressDto): string {
  if (!addr) return "—";
  const parts = [
    [addr.firstName, addr.lastName].filter(Boolean).join(" "),
    addr.company,
    addr.street,
    addr.addressLine2,
    [addr.area, addr.postalCode].filter(Boolean).join(" "),
    addr.country,
    addr.phone,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (user && id) fetchOrder();
  }, [user, id]);

  async function fetchOrder() {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrder(Number(id));
      setOrder(data ?? null);
    } catch {
      setError("Failed to load order.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus: OrderStatus) {
    if (!order?.id) return;
    setStatusUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, newStatus);
      if (updated) setOrder(updated);
    } catch {
      alert("Failed to update order status.");
    } finally {
      setStatusUpdating(false);
    }
  }

  if (!user) return null;

  return (
    <main className="order-detail">
      <button className="order-detail__back" onClick={() => navigate("/orders")}>
        ← Back to Orders
      </button>

      {error && <p className="order-detail__error">{error}</p>}

      {loading ? (
        <p className="order-detail__loading">Loading…</p>
      ) : !order ? (
        <p className="order-detail__empty">Order not found.</p>
      ) : (
        <>
          <div className="order-detail__header">
            <h1 className="order-detail__title">Order #{order.id}</h1>
            <span className={`order-detail__status order-detail__status--${(order.status ?? "").toLowerCase()}`}>
              {order.status ?? "—"}
            </span>
          </div>

            <div className="order-detail__meta">
              {user.role === "ADMIN" && (
                <div className="order-detail__meta-row">
                  <span className="order-detail__meta-label">Customer</span>
                  <span>{order.userEmail ?? "—"}</span>
                </div>
              )}
              <div className="order-detail__meta-row">
                <span className="order-detail__meta-label">Order Date</span>
                <span>{order.orderDate ? new Date(order.orderDate).toLocaleString() : "—"}</span>
              </div>
              <div className="order-detail__meta-row">
                <span className="order-detail__meta-label">Last Updated</span>
                <span>{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "—"}</span>
              </div>
              <div className="order-detail__meta-row">
                <span className="order-detail__meta-label">Shipping Address</span>
                <span>{formatAddress(order.shippingAddress)}</span>
              </div>
              {order.billingAddress && (
                <div className="order-detail__meta-row">
                  <span className="order-detail__meta-label">Billing Address</span>
                  <span>{formatAddress(order.billingAddress)}</span>
                </div>
              )}
              {order.shippingMethod && (
                <div className="order-detail__meta-row">
                  <span className="order-detail__meta-label">Shipping Method</span>
                  <span>{order.shippingMethod}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="order-detail__meta-row">
                  <span className="order-detail__meta-label">Tracking Number</span>
                  <span>{order.trackingNumber}</span>
                </div>
              )}
              {order.notes && (
                <div className="order-detail__meta-row">
                  <span className="order-detail__meta-label">Notes</span>
                  <span>{order.notes}</span>
                </div>
              )}
              {order.payment && (
                <div className="order-detail__meta-row">
                  <span className="order-detail__meta-label">Payment</span>
                  <span className={`order-detail__payment order-detail__payment--${(order.payment.paymentStatus ?? "").toLowerCase().replace("_", "-")}`}>
                    {order.payment.paymentStatus ?? "—"}
                  </span>
                </div>
              )}
            </div>

          {user.role === "ADMIN" && (
            <div className="order-detail__status-change">
              <label htmlFor="status-select" className="order-detail__status-label">
                Change Status
              </label>
              <select
                id="status-select"
                className="order-detail__status-select"
                value={order.status ?? ""}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                disabled={statusUpdating}
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {statusUpdating && <span className="order-detail__status-saving">Saving…</span>}
            </div>
          )}

          <h2 className="order-detail__section-title">Items</h2>
          <div className="order-detail__items-wrapper">
            <table className="order-detail__items-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.items ?? []).map((item) => (
                  <tr
                    key={item.id}
                    className="order-detail__item-row"
                    onClick={() => item.articleId && navigate(`/articles/${item.articleId}`)}
                    title={item.articleId ? `View ${item.articleName ?? "article"}` : undefined}
                  >
                    <td>{item.articleName ?? `Article #${item.articleId}`}</td>
                    <td>{item.unitPrice != null ? `${item.unitPrice.toFixed(2)} kr` : "—"}</td>
                    <td>{item.quantity ?? 0}</td>
                    <td>{item.subtotal != null ? `${item.subtotal.toFixed(2)} kr` : "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="order-detail__total-label">Total</td>
                  <td className="order-detail__total-value">
                    {order.totalPrice != null ? `${order.totalPrice.toFixed(2)} kr` : "—"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
