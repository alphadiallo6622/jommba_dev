"use client";
// components/admin/ui/rich-text-editor.tsx
import { useLayoutEffect, useRef } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Heading2, Heading3,
} from "lucide-react";

type ToolItem =
  | { kind: "btn"; icon?: React.ElementType; label?: string; cmd: string; val?: string; tip: string }
  | { kind: "sep" };

const TOOLBAR: ToolItem[] = [
  { kind: "btn", icon: Bold,          cmd: "bold",               tip: "Gras (Ctrl+B)"    },
  { kind: "btn", icon: Italic,        cmd: "italic",             tip: "Italique (Ctrl+I)" },
  { kind: "btn", icon: Underline,     cmd: "underline",          tip: "Souligné (Ctrl+U)" },
  { kind: "btn", icon: Strikethrough, cmd: "strikeThrough",      tip: "Barré"             },
  { kind: "sep" },
  { kind: "btn", icon: Heading2,      cmd: "formatBlock", val: "<h2>", tip: "Titre 2"    },
  { kind: "btn", icon: Heading3,      cmd: "formatBlock", val: "<h3>", tip: "Titre 3"    },
  { kind: "sep" },
  { kind: "btn", icon: List,          cmd: "insertUnorderedList", tip: "Liste à puces"   },
  { kind: "btn", icon: ListOrdered,   cmd: "insertOrderedList",   tip: "Liste numérotée" },
];

const FONT_SIZES = [
  { label: "Taille…", value: ""  },
  { label: "Petit",   value: "1" },
  { label: "Normal",  value: "3" },
  { label: "Grand",   value: "5" },
  { label: "Titre",   value: "7" },
];

interface Props {
  initialContent?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  initialContent = "",
  onChange,
  placeholder = "Rédigez votre contenu…",
  minHeight = "260px",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Initialize once on mount — avoids cursor-reset on every keystroke
  useLayoutEffect(() => {
    if (ref.current) ref.current.innerHTML = initialContent;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const execCmd = (cmd: string, val?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(ref.current?.innerHTML ?? "");
  };

  return (
    <div className="border border-[var(--color-line)] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-brand-300)] focus-within:border-[var(--color-brand-400)] transition">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-[var(--color-faint)] border-b border-[var(--color-line)]">
        {TOOLBAR.map((item, i) => {
          if (item.kind === "sep") {
            return <span key={i} className="w-px h-5 bg-[var(--color-line-2)] mx-1 shrink-0" />;
          }
          const { icon: Icon, label, cmd, val, tip } = item;
          return (
            <button
              key={i}
              type="button"
              title={tip}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur
                execCmd(cmd, val);
              }}
              className="p-1.5 rounded text-[var(--color-ink)] hover:bg-[var(--color-line-2)] active:bg-[var(--color-line)] transition-colors min-w-[28px] flex items-center justify-center"
            >
              {Icon
                ? <Icon className="w-3.5 h-3.5" />
                : <span className="text-xs font-bold leading-none">{label}</span>
              }
            </button>
          );
        })}

        {/* Font size */}
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) execCmd("fontSize", e.target.value);
          }}
          className="ml-1 text-xs border border-[var(--color-line)] rounded-md px-1.5 py-1 bg-[var(--color-surface)] text-[var(--color-ink)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-300)]"
        >
          {FONT_SIZES.map(({ label, value }) => (
            <option key={label} value={value} disabled={!value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        className="rte-editor px-4 py-3 text-sm text-[var(--color-ink)] focus:outline-none leading-relaxed"
        style={{ minHeight }}
      />
    </div>
  );
}
