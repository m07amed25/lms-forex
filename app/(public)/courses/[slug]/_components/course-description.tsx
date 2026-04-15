export default function CourseDescription({
  descriptionHtml,
}: {
  descriptionHtml: string;
}) {
  if (!descriptionHtml) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">About This Course</h2>
      <div
        className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />
    </section>
  );
}

