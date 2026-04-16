"use client";

import MDEditor from "@uiw/react-md-editor";

type Props = {
  content?: string | null;
};

export default function CoverLetterPreview({ content }: Props) {

  const safeContent = content ?? "";

  return (
    <div className="py-4" data-color-mode="light">
      <MDEditor
        value={safeContent}
        preview="preview"
        height={700}
        hideToolbar
      />
    </div>
  );
}