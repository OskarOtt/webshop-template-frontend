import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listOrders } from "../api";
import type { OrderResponse } from "../generated/models";
import "../styles/OrdersPage.css";

type SortKey = "id" | "userEmail" | "orderDate" | "status" | "items" | "totalPrice";
type SortDir = "asc" | "desc";

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <span className="orders__sort-icon orders__sort-icon--inactive">↕</span>;
  return <span className="orders__sort-icon">{sortDir === "asc" ? "↑" : "↓"}</span>;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const fetchOrders = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, fetchOrders]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      let aVal: string | number | null | undefined;
      let bVal: string | number | null | undefined;

      if (sortKey === "items") {
        aVal = a.items?.length ?? 0;
        bVal = b.items?.length ?? 0;
      } else {
        aVal = a[sortKey] as string | number | null | undefined;
        bVal = b[sortKey] as string | number | null | undefined;
      }

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [orders, sortKey, sortDir]);

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
                <th className={`orders__th${sortKey === "id" ? " orders__th--active" : ""}`} onClick={() => handleSort("id")}>
                  Order # <SortIcon col="id" sortKey={sortKey} sortDir={sortDir} />
                </th>
                {user.role === "ADMIN" && (
                  <th className={`orders__th${sortKey === "userEmail" ? " orders__th--active" : ""}`} onClick={() => handleSort("userEmail")}>
                    Customer <SortIcon col="userEmail" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                )}
                <th className={`orders__th${sortKey === "orderDate" ? " orders__th--active" : ""}`} onClick={() => handleSort("orderDate")}>
                  Date <SortIcon col="orderDate" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th className={`orders__th${sortKey === "status" ? " orders__th--active" : ""}`} onClick={() => handleSort("status")}>
                  Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th className={`orders__th${sortKey === "items" ? " orders__th--active" : ""}`} onClick={() => handleSort("items")}>
                  Items <SortIcon col="items" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th className={`orders__th${sortKey === "totalPrice" ? " orders__th--active" : ""}`} onClick={() => handleSort("totalPrice")}>
                  Total <SortIcon col="totalPrice" sortKey={sortKey} sortDir={sortDir} />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => (
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
