import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticle } from "../api/articles";
import type { ArticleResponse } from "../generated/models";
import "../styles/ArticlePage.css";

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getArticle(Number(id))
      .then((data) => setArticle(data ?? null))
      .catch(() => setError("Failed to load product."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="article-page__status">Loading…</p>;
  if (error) return <p className="article-page__status article-page__status--error">{error}</p>;
  if (!article) return <p className="article-page__status">Product not found.</p>;

  return (
    <main className="article-page">
      <button className="article-page__back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="article-page__content">
        <div className="article-page__image-wrapper">
          {article.imageUrl ? (
            <img className="article-page__image" src={article.imageUrl} alt={article.name ?? "Product"} />
          ) : (
            <div className="article-page__image-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="article-page__details">
          {article.category && (
            <span className="article-page__category">{article.category}</span>
          )}
          <h1 className="article-page__name">{article.name}</h1>

          <p className="article-page__price">
            {article.price != null ? `${article.price.toFixed(2)} kr` : "—"}
          </p>

          {article.description && (
            <p className="article-page__description">{article.description}</p>
          )}

          <p className="article-page__stock">
            {article.stockQuantity != null && article.stockQuantity > 0
              ? `${article.stockQuantity} in stock`
              : "Out of stock"}
          </p>

          <button className="article-page__add-to-cart" disabled={!article.stockQuantity}>
            Add to Cart
          </button>
        </div>
      </div>
    </main>
  );
}
