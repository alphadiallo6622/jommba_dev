"use client";
// app/admin/(protected)/blog/page.tsx
import { useState } from "react";
import { PlusCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { BLOG_POSTS, type BlogPost, type PostStatus } from "@/lib/admin/mock-data";
import { RichTextEditor } from "@/components/admin/ui/rich-text-editor";
import { useToast } from "@/components/admin/ui/toast";

const PER_PAGE = 9;

const CATEGORIES = ["Conseils", "Famille", "Spiritualité", "Événements", "Actualités"];

const CATEGORY_GRADIENT: Record<string, string> = {
  "Conseils":     "from-emerald-500 to-teal-400",
  "Famille":      "from-orange-500 to-amber-400",
  "Spiritualité": "from-purple-500 to-violet-400",
  "Événements":   "from-pink-500 to-rose-400",
  "Actualités":   "from-blue-500 to-cyan-400",
};

interface EditForm {
  id: string;
  title: string;
  category: string;
  author: string;
  excerpt: string;
  content: string;
  featured: boolean;
}

const EMPTY_FORM: EditForm = {
  id: "", title: "", category: "Conseils", author: "Équipe Jommba",
  excerpt: "", content: "", featured: false,
};

function frDate(): string {
  return new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

/* ── Article Modal ─────────────────────────────────────────────────────────── */
function ArticleModal({
  form,
  onChange,
  onSave,
  onClose,
}: {
  form: EditForm;
  onChange: (f: EditForm) => void;
  onSave: (status: PostStatus) => void;
  onClose: () => void;
}) {
  const isEditing = !!form.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-line)] shrink-0">
          <h2 className="text-lg font-bold text-[var(--color-ink)]">
            {isEditing ? "Modifier l'article" : "Nouvel article"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-faint)] text-[var(--color-muted)] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Titre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              placeholder="Titre de l'article"
              className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition"
            />
          </div>

          {/* Catégorie + Auteur */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink)]">Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => onChange({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] transition"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink)]">Auteur</label>
              <input
                value={form.author}
                onChange={(e) => onChange({ ...form, author: e.target.value })}
                placeholder="Nom de l'auteur"
                className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Extrait */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">Extrait</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => onChange({ ...form, excerpt: e.target.value })}
              placeholder="Résumé court affiché sur la carte…"
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition resize-none"
            />
          </div>

          {/* Contenu — rich text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">Contenu</label>
            <RichTextEditor
              key={form.id || "new"}
              initialContent={form.content}
              onChange={(html) => onChange({ ...form, content: html })}
              placeholder="Rédigez votre article…"
              minHeight="280px"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-line)] bg-[var(--color-faint)] rounded-b-2xl shrink-0">
          <button
            onClick={() => onSave("draft")}
            className="px-5 py-2.5 rounded-xl border border-[var(--color-line)] text-sm font-semibold text-[var(--color-ink)] hover:bg-white transition-colors"
          >
            Brouillon
          </button>
          <button
            onClick={() => onSave("published")}
            className="px-6 py-2.5 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors"
          >
            Publier
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function BlogPage() {
  const { show }  = useToast();
  const [posts, setPosts]   = useState<BlogPost[]>(BLOG_POSTS);
  const [page, setPage]     = useState(1);
  const [form, setForm]     = useState<EditForm | null>(null);

  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  const visible    = posts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openNew  = () => setForm({ ...EMPTY_FORM });
  const openEdit = (post: BlogPost) =>
    setForm({
      id:       post.id,
      title:    post.title,
      category: post.category,
      author:   post.author,
      excerpt:  post.excerpt  ?? "",
      content:  post.content  ?? "",
      featured: post.featured ?? false,
    });

  const handleSave = (status: PostStatus) => {
    if (!form) return;
    if (!form.title.trim()) {
      show("Le titre est requis", "warning");
      return;
    }

    const gradient = CATEGORY_GRADIENT[form.category] ?? "from-gray-400 to-gray-300";
    const date     = status === "published" ? frDate() : "—";

    if (form.id) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === form.id
            ? { ...p, ...form, status, gradient, date: status === "published" && p.date === "—" ? date : p.date }
            : p,
        ),
      );
      show(status === "published" ? "Article publié" : "Brouillon sauvegardé", "success");
    } else {
      const newPost: BlogPost = {
        id: `p${Date.now()}`,
        title: form.title, category: form.category, author: form.author,
        excerpt: form.excerpt, content: form.content, featured: form.featured,
        status, gradient, date,
      };
      setPosts((prev) => [newPost, ...prev]);
      setPage(1);
      show(status === "published" ? "Article publié" : "Article enregistré en brouillon", "success");
    }
    setForm(null);
  };

  const handlePublishCard = (post: BlogPost) => {
    setPosts((prev) =>
      prev.map((p) => p.id === post.id ? { ...p, status: "published", date: frDate() } : p),
    );
    show(`Article publié · ${post.title.slice(0, 40)}`, "success");
  };

  const handleRetire = (post: BlogPost) => {
    setPosts((prev) =>
      prev.map((p) => p.id === post.id ? { ...p, status: "draft" } : p),
    );
    show(`Article retiré · ${post.title.slice(0, 40)}`, "warning");
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-ink)]">Blog</h1>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">
              Gestion éditoriale du contenu Jommba.
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Nouvel article
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((post) => (
            <div
              key={post.id}
              className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)] shadow-[var(--shadow-card)] overflow-hidden"
            >
              {/* Gradient header */}
              <div className={`relative h-28 bg-gradient-to-br ${post.gradient}`}>
                {post.featured && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-sm">
                    À la une
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-faint)] text-[var(--color-muted)]">
                    {post.category}
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] font-semibold ${post.status === "published" ? "text-emerald-600" : "text-[var(--color-muted)]"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${post.status === "published" ? "bg-emerald-500" : "bg-gray-400"}`} />
                    {post.status === "published" ? "Publié" : "Brouillon"}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)] leading-snug line-clamp-2">
                    {post.title}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    {post.author}{post.date !== "—" && ` · ${post.date}`}
                  </p>
                  {post.excerpt && (
                    <p className="text-xs text-[var(--color-muted)] mt-1 line-clamp-2">{post.excerpt}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(post)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
                  >
                    Éditer
                  </button>
                  {post.status === "published" ? (
                    <button
                      onClick={() => handleRetire(post)}
                      className="px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-xs font-semibold text-[var(--color-muted)] hover:bg-[var(--color-faint)] transition-colors"
                    >
                      Retirer
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePublishCard(post)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--color-brand-600)] text-white text-xs font-semibold hover:bg-[var(--color-brand-700)] transition-colors"
                    >
                      Publier
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[var(--color-muted)]">
              {posts.length} articles · page {page} / {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] disabled:opacity-40 hover:bg-[var(--color-faint)] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    p === page
                      ? "bg-[var(--color-brand-600)] text-white"
                      : "border border-[var(--color-line)] text-[var(--color-ink)] hover:bg-[var(--color-faint)]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] disabled:opacity-40 hover:bg-[var(--color-faint)] transition-colors"
              >
                Suivant <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {form && (
        <ArticleModal
          form={form}
          onChange={setForm}
          onSave={handleSave}
          onClose={() => setForm(null)}
        />
      )}
    </>
  );
}
