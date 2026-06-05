import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getArticles, createArticle, updateArticle, deleteArticle } from "../api/articles";
import type { ArticleRequest, ArticleResponse } from "../generated/models";
import ArticleFormModal from "../components/ArticleFormModal";
import "../styles/AdminArticlesPage.css";

export default function AdminArticlesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<ArticleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleResponse | null>(null);

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
      const data = await getArticles();
      setArticles(data ?? []);
    } catch {
      setError("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingArticle(null);
    setModalOpen(true);
  }

  function openEdit(article: ArticleResponse) {
    setEditingArticle(article);
    setModalOpen(true);
  }

  async function handleSave(data: ArticleRequest) {
    if (editingArticle?.id != null) {
      await updateArticle(editingArticle.id, data);
    } else {
      await createArticle(data);
    }
    await fetchArticles();
  }

  async function handleDelete(article: ArticleResponse) {
    if (!window.confirm(`Delete "${article.name}"? This cannot be undone.`)) return;
    try {
      await deleteArticle(article.id!);
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="admin-articles__id">{article.id}</td>
                  <td className="admin-articles__name">{article.name}</td>
                  <td>{article.brand?.name ?? "—"}</td>
                  <td>{article.category?.name ?? "—"}</td>
                  <td>{article.price != null ? `${article.price.toFixed(2)} kr` : "—"}</td>
                  <td>{article.stockQuantity ?? 0}</td>
                  <td className="admin-articles__actions">
                    <button className="admin-articles__btn admin-articles__btn--edit" onClick={() => openEdit(article)}>
                      Edit
                    </button>
                    <button className="admin-articles__btn admin-articles__btn--delete" onClick={() => handleDelete(article)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ArticleFormModal
        open={modalOpen}
        article={editingArticle}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </main>
  );
}
