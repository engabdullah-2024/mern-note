import React from 'react';
export default function NoteCard({ note, onEdit, onSoftDelete, onHardDelete }) {
  return (
    <div className="group rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-6">
          {note.title || "Untitled"}
        </h3>
        {note.isPinned && <span title="Pinned">📌</span>}
      </div>

      <p className="mt-2 text-sm text-slate-600 line-clamp-3">
        {note.contentPreview}
      </p>

      <div className="mt-3 flex flex-wrap gap-1">
        {note.tags?.slice(0, 4).map((t) => (
          <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-slate-100 border">
            {t}
          </span>
        ))}
        {note.status !== "active" && (
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 border border-amber-200 text-amber-800">
            {note.status}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{note.updatedAt ? new Date(note.updatedAt).toLocaleString() : ""}</span>
        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100">
          <button
            onClick={() => onEdit(note)}
            className="rounded-lg border px-3 py-1 hover:bg-slate-50"
            title="Edit"
          >
            Edit
          </button>
          <button
            onClick={() => onSoftDelete(note)}
            className="rounded-lg border px-3 py-1 hover:bg-slate-50 text-amber-700 border-amber-200"
            title="Move to Trash"
          >
            Trash
          </button>
          <button
            onClick={() => onHardDelete(note)}
            className="rounded-lg border px-3 py-1 hover:bg-red-50 text-red-600 border-red-200"
            title="Delete permanently"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
