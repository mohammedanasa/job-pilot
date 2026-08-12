"use client";

import { useRef, useState } from "react";

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
};

export function TagInput({ tags, onChange, suggestions, placeholder = "Add a skill..." }: Props) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = input.trim()
    ? suggestions.filter(
        (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s),
      )
    : [];

  function addTag(value: string) {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        addTag(filtered[0]);
      } else if (input.trim()) {
        addTag(input);
      }
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-accent-light px-3 py-0.5 text-xs font-medium text-accent"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 text-accent hover:opacity-70"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          placeholder={tags.length === 0 ? placeholder : ""}
          onChange={(e) => {
            setInput(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          className="min-w-[120px] flex-1 bg-transparent text-sm font-medium text-text-primary placeholder:text-text-muted outline-none"
        />
      </div>

      {showDropdown && filtered.length > 0 && (
        <div className="relative z-10">
          <ul className="absolute left-0 right-0 top-0 max-h-48 overflow-y-auto rounded-md border border-border bg-surface shadow-sm">
            {filtered.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={() => addTag(s)}
                  className="w-full px-3 py-2 text-left text-sm font-medium text-text-primary hover:bg-surface-secondary"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (input.trim()) addTag(input);
          }}
          className="rounded-md border border-border bg-surface px-3 py-1 text-sm font-medium text-text-primary hover:bg-surface-secondary"
        >
          Add
        </button>
      </div>
    </div>
  );
}
