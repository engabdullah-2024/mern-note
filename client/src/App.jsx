import React, { useEffect, useState } from "react";
import axios from "axios";
import NoteCard from "./components/NoteCard";
import Modal from "./components/Modal";
import NoteForm from "./components/NoteForm";

const api = axios.create({
  baseURL: "", // use Vite proxy
  timeout: 8000,
});

export default function App() {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);

  const [newOpen, setNewOpen] = useState(false);

  async function load() {
    try {
      setError("");
      const { data } = await api.get("/api/notes");
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setNotes(items ?? []);
    } catch (e) {
      setError(describeAxiosError(e, "Failed to load notes."));
      setNotes([]);
    }
  }

  useEffect(() => { load(); }, []);

  async function createNote(payload) {
    try {
      setPending(true); setError("");
      await api.post("/api/notes", payload);
      setNewOpen(false);
      await load();
    } catch (e) {
      setError(describeAxiosError(e, "Failed to add note."));
    } finally {
      setPending(false);
    }
  }

  async function updateNote(id, payload) {
    try {
      setPending(true); setError("");
      await api.put(`/api/notes/${id}`, payload);
      setEditOpen(false);
      setEditNote(null);
      await load();
    } catch (e) {
      setError(describeAxiosError(e, "Failed to update note."));
    } finally {
      setPending(false);
    }
  }

  async function softDelete(note) {
    if (!confirm(`Move "${note.title || "Untitled"}" to trash?`)) return;
    try {
      setPending(true); setError("");
      await api.delete(`/api/notes/${note._id}`);
      await load();
    } catch (e) {
      setError(describeAxiosError(e, "Failed to move to trash."));
    } finally {
      setPending(false);
    }
  }

  async function hardDelete(note) {
    if (!confirm(`Permanently delete "${note.title || "Untitled"}"? This cannot be undone.`)) return;
    try {
      setPending(true); setError("");
      await api.delete(`/api/notes/${note._id}?hard=true`);
      await load();
    } catch (e) {
      setError(describeAxiosError(e, "Failed to delete note."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">MERN Notes</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNewOpen(true)}
              className="rounded-lg bg-black text-white px-4 py-2 hover:opacity-90"
              disabled={pending}
            >
              New Note
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {notes.length === 0 ? (
          <EmptyState onNew={() => setNewOpen(true)} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((n) => (
              <NoteCard
                key={n._id}
                note={n}
                onEdit={(note) => { setEditNote(note); setEditOpen(true); }}
                onSoftDelete={softDelete}
                onHardDelete={hardDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* New Note Modal */}
      <Modal open={newOpen} title="New Note" onClose={() => setNewOpen(false)}>
        <NoteForm
          initial={{}}
          submitting={pending}
          onSubmit={(payload) => createNote(payload)}
          onCancel={() => setNewOpen(false)}
        />
      </Modal>

      {/* Edit Note Modal */}
      <Modal open={editOpen} title="Edit Note" onClose={() => { setEditOpen(false); setEditNote(null); }}>
        <NoteForm
          initial={editNote || {}}
          submitting={pending}
          onSubmit={(payload) => updateNote(editNote._id, payload)}
          onCancel={() => { setEditOpen(false); setEditNote(null); }}
        />
      </Modal>
    </div>
  );
}

function EmptyState({ onNew }) {
  return (
    <div className="mt-12 grid place-items-center text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl border bg-white grid place-items-center text-2xl">
          📝
        </div>
        <h2 className="text-lg font-semibold">No notes yet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Create your first note to get started. You can edit, pin, tag, and organize later.
        </p>
        <button
          onClick={onNew}
          className="mt-4 rounded-lg bg-black text-white px-4 py-2 hover:opacity-90"
        >
          Create a Note
        </button>
      </div>
    </div>
  );
}

function describeAxiosError(e, fallback) {
  if (e?.response) {
    const msg = e.response.data?.message || e.message;
    return `${fallback} [${e.response.status}] ${msg ?? ""}`.trim();
  }
  if (e?.request) return `${fallback} (no response from server)`;
  return `${fallback} ${e?.message ?? ""}`.trim();
}
