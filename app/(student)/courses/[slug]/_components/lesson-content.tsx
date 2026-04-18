import { tiptapJsonToHtml } from "@/lib/tiptap-html";

type LessonContentProps = {
  content: string;
};

export function LessonContent({ content }: LessonContentProps) {
  const html = tiptapJsonToHtml(content);

  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

