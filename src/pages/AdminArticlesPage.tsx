import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getArticles, deleteArticle, changeArticleStatus } from "../api/articles";
import type { ArticleResponse } from "../generated/models";
import "../styles/AdminArticlesPage.css";

export default function AdminArticlesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<ArticleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchArticles();
    }
  }, [user]);

  async function fetchArticles() {
    setLoading(true);
    setError(null);
    try {
      const [active, disabled, deleted] = await Promise.all([
        getArticles("ACTIVE"),
        getArticles("DISABLED"),
        getArticles("DELETED"),
      ]);
      setArticles([...(active ?? []), ...(disabled ?? []), ...(deleted ?? [])]);
    } catch {
      setError("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    navigate("/admin/articles/new");
  }

  function openEdit(article: ArticleResponse) {
    navigate(`/admin/articles/${article.id}/edit`);
  }

  async function handleToggleStatus(article: ArticleResponse) {
    const newStatus = article.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      const updated = await changeArticleStatus(article.id!, newStatus);
      if (updated) {
        setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      }
    } catch {
      alert("Failed to update article status.");
    }
  }

  async function handleDelete(article: ArticleResponse) {
    if (!window.confirm(`Soft-delete "${article.name}"? This will mark it as DELETED.`)) return;
    try {
      await deleteArticle(article.id!);
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, status: "DELETED" as const } : a))
      );
    } catch {
      alert("Failed to delete article.");
    }
  }

  if (!user || user.role !== "ADMIN") return null;

  return (
    <main className="admin-articles">
      <div className="admin-articles__header">
        <h1 className="admin-articles__title">Articles</h1>
        <button className="admin-articles__add-btn" onClick={openCreate}>
          + Add Article
        </button>
      </div>

      {error && <p className="admin-articles__error">{error}</p>}

      {loading ? (
        <p className="admin-articles__loading">Loading…</p>
      ) : articles.length === 0 ? (
        <p className="admin-articles__empty">No articles yet. Add one to get started.</p>
      ) : (
        <div className="admin-articles__table-wrapper">
          <table className="admin-articles__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className={article.status === "DELETED" ? "admin-articles__row--deleted" : ""}>
                  <td className="admin-articles__id">{article.id}</td>
                  <td className="admin-articles__name">{article.name}</td>
                  <td>{article.brand?.name ?? "—"}</td>
                  <td>{article.category?.name ?? "—"}</td>
                  <td>{article.price != null ? `${article.price.toFixed(2)} kr` : "—"}</td>
                  <td>{article.stockQuantity ?? 0}</td>
                  <td>
                    <span className={`admin-articles__status admin-articles__status--${(article.status ?? "").toLowerCase()}`}>
                      {article.status ?? "—"}
                    </span>
                  </td>
                  <td className="admin-articles__actions">
                    {article.status !== "DELETED" && (
                      <>
                        <button className="admin-articles__btn admin-articles__btn--edit" onClick={() => openEdit(article)}>
                          Edit
                        </button>
                        <button
                          className={`admin-articles__btn ${article.status === "ACTIVE" ? "admin-articles__btn--disable" : "admin-articles__btn--enable"}`}
                          onClick={() => handleToggleStatus(article)}
                        >
                          {article.status === "ACTIVE" ? "Disable" : "Enable"}
                        </button>
                        <button className="admin-articles__btn admin-articles__btn--delete" onClick={() => handleDelete(article)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
