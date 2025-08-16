import { Schema, model, InferSchemaType } from "mongoose";

const collaboratorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["viewer", "editor"], default: "editor" },
}, { _id: false });

const noteSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  notebookId: { type: Schema.Types.ObjectId, ref: "Notebook", index: true },
  title: { type: String, trim: true, default: "", maxlength: 300 },
  content: { type: String, default: "" }, // TipTap JSON string or markdown
  contentPreview: { type: String, default: "", maxlength: 3000 },
  tags: { type: [String], default: [], index: true },
  isPinned: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "archived", "trashed"], default: "active", index: true },
  reminderAt: { type: Date },
  collaborators: { type: [collaboratorSchema], default: [] },
}, { timestamps: true });

noteSchema.index({ ownerId: 1, updatedAt: -1, _id: -1 });
noteSchema.index({ title: "text", contentPreview: "text" });

export type NoteDoc = InferSchemaType<typeof noteSchema>;
export default model<NoteDoc>("Note", noteSchema);
