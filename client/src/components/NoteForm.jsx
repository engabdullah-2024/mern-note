import React from "react";
import { useEffect, useState } from "react";

export default function NoteForm({ initial, onSubmit, onCancel, submitting }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [contentPreview, setContentPreview] = useState(initial?.contentPreview ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [isPinned, setIsPinned] = useState(Boolean(initial?.isPinned));

  useEffect(() => {
    setTitle(initial?.title ?? "");
    setContentPreview(initial?.contentPreview ?? "");
    setTags((initial?.tags ?? []).join(", "));
    setIsPinned(Boolean(initial?.isPinned));
  }, [initial]);

  function handleSubmit(e) {
    e.preventDefault();
    const cleanTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 20);
    onSubmit({
      title,
      contentPreview,
      tags: cleanTags,
      isPinned,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input
        className="border rounded-lg px-3 py-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={300}
      />
      <textarea
        className="border rounded-lg px-3 py-2 min-h-[120px]"
        placeholder="Preview / summary"
        value={contentPreview}
        onChange={(e) => setContentPreview(e.target.value)}
        maxLength={3000}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
          />
          Pinned
        </label>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
