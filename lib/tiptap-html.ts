import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import type { JSONContent } from "@tiptap/core";

/**
 * Extensions list matching the editor configuration in
 * `components/rich-text-editor/editor.tsx`.
 * Used for server-side JSON → HTML conversion.
 */
const extensions = [
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
  Superscript,
  Subscript,
];

/**
 * Convert a Tiptap JSON string (as stored in the database) to HTML.
 * Falls back to returning the raw string if it is not valid JSON
 * (e.g. legacy HTML content).
 */
export function tiptapJsonToHtml(jsonString: string): string {
  if (!jsonString) return "";

  try {
    const json: JSONContent = JSON.parse(jsonString);
    return generateHTML(json, extensions);
  } catch {
    // If parsing fails, assume the string is already HTML (legacy data)
    return jsonString;
  }
}

