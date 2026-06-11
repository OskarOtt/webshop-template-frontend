import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listOrders } from "../api/orders";
import type { OrderResponse } from "../generated/models";
import "../styles/OrdersPage.css";

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrders();
      setOrders(data);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <main className="orders">
      <div className="orders__header">
        <h1 className="orders__title">
          {user.role === "ADMIN" ? "All Orders" : "My Orders"}
        </h1>
      </div>

      {error && <p className="orders__error">{error}</p>}

      {loading ? (
        <p className="orders__loading">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="orders__empty">No orders found.</p>
      ) : (
        <div className="orders__table-wrapper">
          <table className="orders__table">
            <thead>
              <tr>
                <th>Order #</th>
                {user.role === "ADMIN" && <th>Customer</th>}
                <th>Date</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="orders__row"
                  onClick={() => navigate(`/orders/${order.id}`)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/orders/${order.id}`)}
                >
                  <td className="orders__id">#{order.id}</td>
                  {user.role === "ADMIN" && (
                    <td className="orders__customer">{order.userEmail ?? "—"}</td>
                  )}
                  <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "—"}</td>
                  <td>
                    <span className={`orders__status orders__status--${(order.status ?? "").toLowerCase()}`}>
                      {order.status ?? "—"}
                    </span>
                  </td>
                  <td>{order.items?.length ?? 0}</td>
                  <td>{order.totalPrice != null ? `${order.totalPrice.toFixed(2)} kr` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
