import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticle } from "../api";
import { useCart } from "../context/CartContext";
import type { ArticleResponse } from "../generated/models";
import "../styles/ArticlePage.css";

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

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

  if (article.status === "DELETED") {
    return (
      <main className="article-page">
        <button className="article-page__back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="article-page__deleted">
          <p>This item no longer exists.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="article-page">
      <button className="article-page__back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="article-page__content">
        <div className="article-page__image-wrapper">
          {article.images?.[0] ? (
            <img className="article-page__image" src={article.images[0]} alt={article.name ?? "Product"} />
          ) : (
            <div className="article-page__image-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="article-page__details">
          {article.category?.name && (
            <span className="article-page__category">{article.category.name}</span>
          )}
          <h1 className="article-page__name">{article.name}</h1>

          <p className="article-page__price">
            {article.price != null ? `${article.price.toFixed(2)} kr` : "—"}
          </p>

          {article.description && (
            <p className="article-page__description">{article.description}</p>
          )}

          {article.brand?.name && (
            <p className="article-page__brand">Brand: {article.brand.name}</p>
          )}

          <dl className="article-page__meta">
            {article.sku && (
              <>
                <dt>SKU</dt>
                <dd>{article.sku}</dd>
              </>
            )}
            {article.size && (
              <>
                <dt>Size</dt>
                <dd>{article.size}</dd>
              </>
            )}
            {article.color && (
              <>
                <dt>Color</dt>
                <dd>{article.color}</dd>
              </>
            )}
            {article.weight != null && (
              <>
                <dt>Weight</dt>
                <dd>{article.weight} kg</dd>
              </>
            )}
          </dl>

          {article.tags && article.tags.length > 0 && (
            <div className="article-page__tags">
              {article.tags.map((tag) => (
                <span key={tag} className="article-page__tag">{tag}</span>
              ))}
            </div>
          )}

          <p className="article-page__stock">
            {article.stockQuantity != null && article.stockQuantity > 0
              ? `${article.stockQuantity} in stock`
              : "Out of stock"}
          </p>

          {article.status === "DISABLED" ? (
            <p className="article-page__unavailable">This article is not available.</p>
          ) : (
            <button
              className="article-page__add-to-cart"
              disabled={!article.stockQuantity}
              onClick={async () => {
                await addItem({
                  articleId: article.id!,
                  quantity: 1,
                  articleName: article.name ?? "Product",
                  mainImageUrl: article.images?.[0],
                  unitPrice: article.price ?? 0,
                });
                setAddedToCart(true);
                setTimeout(() => setAddedToCart(false), 2000);
              }}
            >
              {addedToCart ? "Added!" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
