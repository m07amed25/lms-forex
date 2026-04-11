"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { Menubar } from "./Menubar";
import type { ControllerRenderProps } from "react-hook-form";

interface RichTextEditorProps {
  content?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  field?: ControllerRenderProps;
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Start writing your course content…",
  field,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: "tiptap-code-block",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "tiptap-link",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Superscript,
      Subscript,
    ],
    content: field?.value || content,
    editorProps: {
      attributes: {
        class: "min-h-[300px] p-4 focus:outline-none",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(JSON.stringify(editor.getJSON()));
    },
  });

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30 transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20">
      <Menubar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
