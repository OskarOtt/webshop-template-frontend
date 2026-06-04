import { useNavigate } from "react-router-dom";
import type { ArticleResponse } from "../generated/models";
import "../styles/ProductCard.css";

interface ProductCardProps {
  article: ArticleResponse;
}

export default function ProductCard({ article }: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <article
      className="product-card"
      onClick={() => navigate(`/articles/${article.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/articles/${article.id}`)}
      aria-label={article.name}
    >
      <div className="product-card__image-wrapper">
        {article.imageUrl ? (
          <img className="product-card__image" src={article.imageUrl} alt={article.name ?? "Product"} />
        ) : (
          <div className="product-card__image-placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="product-card__body">
        {article.category && (
          <span className="product-card__category">{article.category}</span>
        )}
        <h2 className="product-card__name">{article.name ?? "Unnamed product"}</h2>
        <p className="product-card__price">
          {article.price != null ? `${article.price.toFixed(2)} kr` : "—"}
        </p>
      </div>
    </article>
  );
}
