"use client";

import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function RichTextEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
  });
}
