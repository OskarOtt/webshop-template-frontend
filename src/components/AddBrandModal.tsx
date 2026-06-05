import { useState } from "react";
import type { BrandResponse } from "../generated/models";
import { createBrand } from "../api/brands";
import "../styles/AddEntityModal.css";

interface AddBrandModalProps {
  onClose: () => void;
  onCreated: (brand: BrandResponse) => void;
}

export default function AddBrandModal({ onClose, onCreated }: AddBrandModalProps) {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const brand = await createBrand({ name: name.trim(), logoUrl: logoUrl.trim() || undefined, description: description.trim() || undefined });
      if (brand) onCreated(brand);
      onClose();
    } catch {
      setError("Failed to create brand. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="aem-overlay" onClick={onClose}>
      <div className="aem-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="add-brand-title">
        <h2 id="add-brand-title" className="aem-title">Add Brand</h2>

        {error && <p className="aem-error">{error}</p>}

        <form className="aem-form" onSubmit={handleSubmit}>
          <label className="aem-label">
            Name *
            <input className="aem-input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>

          <label className="aem-label">
            Logo URL
            <input className="aem-input" type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
          </label>

          <label className="aem-label">
            Description
            <input className="aem-input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>

          <div className="aem-actions">
            <button type="button" className="aem-btn aem-btn--cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="aem-btn aem-btn--save" disabled={saving || !name.trim()}>
              {saving ? "Creating…" : "Create Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
