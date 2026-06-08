import { useNavigate } from "react-router-dom";
import type { ArticleResponse } from "../generated/models";
import { useCart } from "../context/CartContext";
import "../styles/ProductCard.css";

interface ProductCardProps {
  article: ArticleResponse;
}

export default function ProductCard({ article }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    await addItem({
      articleId: article.id!,
      quantity: 1,
      articleName: article.name ?? "Product",
      mainImageUrl: article.images?.[0],
      unitPrice: article.price ?? 0,
    });
  }

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
        {article.images?.[0] ? (
          <img className="product-card__image" src={article.images[0]} alt={article.name ?? "Product"} />
        ) : (
          <div className="product-card__image-placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="product-card__body">
        {article.category?.name && (
          <span className="product-card__category">{article.category.name}</span>
        )}
        <h2 className="product-card__name">{article.name ?? "Unnamed product"}</h2>
        <p className="product-card__price">
          {article.price != null ? `${article.price.toFixed(2)} kr` : "—"}
        </p>
        <button
          className="product-card__add-btn"
          onClick={handleAddToCart}
          disabled={!article.stockQuantity}
          aria-label={`Add ${article.name} to cart`}
        >
          {article.stockQuantity ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </article>
  );
}
