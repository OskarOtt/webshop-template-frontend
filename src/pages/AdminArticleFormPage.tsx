import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getArticle, createArticle, updateArticle } from "../api/articles";
import { getCategories } from "../api/categories";
import { getBrands } from "../api/brands";
import type { ArticleRequest, ArticleResponse, BrandResponse, CategoryResponse } from "../generated/models";
import AddBrandModal from "../components/AddBrandModal";
import AddCategoryModal from "../components/AddCategoryModal";
import "../styles/AdminArticleFormPage.css";

const ADD_NEW = "__add_new__";

interface FormState {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
  brandId: string;
  images: string;
  sku: string;
  size: string;
  weight: string;
  color: string;
  tags: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
  brandId: "",
  images: "",
  sku: "",
  size: "",
  weight: "",
  color: "",
  tags: "",
};

function articleToForm(article: ArticleResponse): FormState {
  return {
    name: article.name ?? "",
    description: article.description ?? "",
    price: article.price != null ? String(article.price) : "",
    stockQuantity: article.stockQuantity != null ? String(article.stockQuantity) : "",
    categoryId: article.category?.id != null ? String(article.category.id) : "",
    brandId: article.brand?.id != null ? String(article.brand.id) : "",
    images: (article.images ?? []).join(", "),
    sku: article.sku ?? "",
    size: article.size ?? "",
    weight: article.weight != null ? String(article.weight) : "",
    color: article.color ?? "",
    tags: (article.tags ?? []).join(", "),
  };
}

function formToArticleRequest(form: FormState): ArticleRequest {
  const parseCsv = (val: string) =>
    val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  return {
    name: form.name || undefined,
    description: form.description || undefined,
    price: form.price !== "" ? Number(form.price) : undefined,
    stockQuantity: form.stockQuantity !== "" ? parseInt(form.stockQuantity, 10) : undefined,
    categoryId: form.categoryId !== "" ? Number(form.categoryId) : undefined,
    brandId: form.brandId !== "" ? Number(form.brandId) : undefined,
    images: parseCsv(form.images).length > 0 ? parseCsv(form.images) : undefined,
    sku: form.sku || undefined,
    size: form.size || undefined,
    weight: form.weight !== "" ? Number(form.weight) : undefined,
    color: form.color || undefined,
    tags: parseCsv(form.tags).length > 0 ? parseCsv(form.tags) : undefined,
  };
}

export default function AdminArticleFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = id != null;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [pageError, setPageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;

    const loadOptions = getCategories().then((cats) => setCategories(cats ?? []));
    const loadBrands = getBrands().then((brnds) => setBrands(brnds ?? []));

    const loads: Promise<unknown>[] = [loadOptions, loadBrands];

    if (isEdit) {
      const loadArticle = getArticle(Number(id)).then((article) => {
        if (!article) throw new Error("Not found");
        setForm(articleToForm(article));
      });
      loads.push(loadArticle);
    }

    setOptionsLoading(true);
    setOptionsError(null);
    setPageLoading(isEdit);

    Promise.all(loads)
      .catch(() => {
        setOptionsError("Failed to load data. Please refresh.");
        setPageError(isEdit ? "Failed to load article." : null);
      })
      .finally(() => {
        setOptionsLoading(false);
        setPageLoading(false);
      });
  }, [user, id, isEdit]);

  if (!user || user.role !== "ADMIN") return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name === "categoryId" && value === ADD_NEW) {
      setShowAddCategory(true);
      return;
    }
    if (name === "brandId" && value === ADD_NEW) {
      setShowAddBrand(true);
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function save(): Promise<void> {
    setSaving(true);
    setSaveError(null);
    try {
      if (isEdit) {
        await updateArticle(Number(id), formToArticleRequest(form));
      } else {
        await createArticle(formToArticleRequest(form));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndBack(e: React.FormEvent) {
    e.preventDefault();
    try {
      await save();
      navigate("/admin/articles");
    } catch {
      setSaveError("Failed to save article. Please try again.");
    }
  }

  async function handleSaveAndAddAnother(e: React.FormEvent) {
    e.preventDefault();
    try {
      await save();
      setForm(EMPTY_FORM);
      setSaveError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSaveError("Failed to save article. Please try again.");
    }
  }

  function handleBrandCreated(brand: BrandResponse) {
    setBrands((prev) => [...prev, brand]);
    setForm((prev) => ({ ...prev, brandId: String(brand.id) }));
  }

  function handleCategoryCreated(category: CategoryResponse) {
    setCategories((prev) => [...prev, category]);
    setForm((prev) => ({ ...prev, categoryId: String(category.id) }));
  }

  if (pageLoading) {
    return (
      <main className="afp">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="afp">
      <div className="afp__header">
        <button type="button" className="afp__back-btn" onClick={() => navigate("/admin/articles")}>
          ← Back to Articles
        </button>
        <h1 className="afp__title">{isEdit ? "Edit Article" : "Add Article"}</h1>
      </div>

      {(saveError || pageError) && <p className="afp__error">{saveError ?? pageError}</p>}
      {optionsError && <p className="afp__error">{optionsError}</p>}

      <form className="afp__form" onSubmit={handleSaveAndBack}>
        {/* Core info */}
        <section className="afp__section">
          <p className="afp__section-title">Basic Info</p>

          <label className="afp__label">
            Name *
            <input className="afp__input" name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label className="afp__label">
            Description
            <textarea className="afp__input afp__textarea" name="description" value={form.description} onChange={handleChange} rows={4} />
          </label>

          <div className="afp__row">
            <label className="afp__label">
              Price *
              <input className="afp__input" name="price" type="number" min={0} step="0.01" value={form.price} onChange={handleChange} required />
            </label>

            <label className="afp__label">
              Stock Quantity *
              <input className="afp__input" name="stockQuantity" type="number" min={0} value={form.stockQuantity} onChange={handleChange} required />
            </label>
          </div>
        </section>

        {/* Classification */}
        <section className="afp__section">
          <p className="afp__section-title">Classification</p>

          <div className="afp__row">
            <div className="afp__select-wrapper">
              <label className="afp__label">
                Category
                <select className="afp__input" name="categoryId" value={form.categoryId} onChange={handleChange} disabled={optionsLoading}>
                  <option value="">— None —</option>
                  <option value={ADD_NEW}>+ Add new category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="afp__select-wrapper">
              <label className="afp__label">
                Brand
                <select className="afp__input" name="brandId" value={form.brandId} onChange={handleChange} disabled={optionsLoading}>
                  <option value="">— None —</option>
                  <option value={ADD_NEW}>+ Add new brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="afp__section">
          <p className="afp__section-title">Details</p>

          <label className="afp__label">
            Images
            <input className="afp__input" name="images" value={form.images} onChange={handleChange} placeholder="https://img1.com, https://img2.com" />
            <span className="afp__hint">Comma-separated URLs</span>
          </label>

          <div className="afp__row">
            <label className="afp__label">
              SKU
              <input className="afp__input" name="sku" value={form.sku} onChange={handleChange} />
            </label>

            <label className="afp__label">
              Size
              <input className="afp__input" name="size" value={form.size} onChange={handleChange} />
            </label>
          </div>

          <div className="afp__row">
            <label className="afp__label">
              Weight (kg)
              <input className="afp__input" name="weight" type="number" min={0} step="0.001" value={form.weight} onChange={handleChange} />
            </label>

            <label className="afp__label">
              Color
              <input className="afp__input" name="color" value={form.color} onChange={handleChange} />
            </label>
          </div>

          <label className="afp__label">
            Tags
            <input className="afp__input" name="tags" value={form.tags} onChange={handleChange} placeholder="electronics, sale, new" />
            <span className="afp__hint">Comma-separated tags</span>
          </label>
        </section>

        <div className="afp__actions">
          {!isEdit && (
            <button
              type="button"
              className="afp__btn afp__btn--secondary"
              disabled={saving || optionsLoading}
              onClick={handleSaveAndAddAnother}
            >
              {saving ? "Saving…" : "Save & Add Another"}
            </button>
          )}
          <button type="submit" className="afp__btn afp__btn--primary" disabled={saving || optionsLoading}>
            {saving ? "Saving…" : "Save Article"}
          </button>
        </div>
      </form>

      {showAddBrand && (
        <AddBrandModal
          onClose={() => setShowAddBrand(false)}
          onCreated={handleBrandCreated}
        />
      )}

      {showAddCategory && (
        <AddCategoryModal
          existingCategories={categories}
          onClose={() => setShowAddCategory(false)}
          onCreated={handleCategoryCreated}
        />
      )}
    </main>
  );
}
