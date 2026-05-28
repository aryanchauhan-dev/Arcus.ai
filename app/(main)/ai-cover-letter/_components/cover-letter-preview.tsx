"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Pencil, X, Save, Download, Copy } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { updateCoverLetter } from "@/actions/cover-letter";
import type { getCoverLetter } from "@/actions/cover-letter";

type CoverLetter = NonNullable<Awaited<ReturnType<typeof getCoverLetter>>>;

type Props = {
  coverLetter: CoverLetter;
  defaultEditing?: boolean;
};

function downloadAsPDF(
  content: string,
  jobTitle: string,
  companyName: string,
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Popup blocked — please allow popups for PDF download");
    return;
  }

  const paragraphs = content
    .split(/\n+/)
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("\n");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${jobTitle} — ${companyName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: "Georgia", "Times New Roman", serif;
            font-size: 12pt;
            line-height: 1.7;
            color: #1a1a1a;
            background: #fff;
          }

          .page {
            max-width: 700px;
            margin: 0 auto;
            padding: 60px 50px;
          }

          .header {
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 16px;
            margin-bottom: 32px;
          }

          .header h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 4px;
          }

          .header p {
            font-size: 10pt;
            color: #555;
          }

          .content p {
            margin-bottom: 14px;
            text-align: justify;
          }

          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { padding: 0; }
            @page { margin: 2cm; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <h1>${jobTitle} — ${companyName}</h1>
            <p>Cover Letter · ${new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  })}</p>
          </div>
          <div class="content">
            ${paragraphs}
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

export default function CoverLetterPreview({
  coverLetter,
  defaultEditing = false,
}: Props) {
  const { resolvedTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [content, setContent] = useState(coverLetter.content ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const colorMode = resolvedTheme === "dark" ? "dark" : "light";
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Cover letter content cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      await updateCoverLetter(coverLetter.id, content);
      toast.success("Cover letter saved successfully");
      setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to save cover letter";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(coverLetter.content ?? "");
    setIsEditing(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy — please select and copy manually");
    }
  };

  const handleDownload = () => {
    downloadAsPDF(content, coverLetter.jobTitle, coverLetter.companyName);
  };

  return (
    <div className="space-y-4">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div className="flex items-center gap-3">
          <Badge variant={isEditing ? "default" : "secondary"}>
            {isEditing ? "Editing" : "Preview"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {wordCount} words · {charCount} characters
          </span>
          {isEditing && content !== coverLetter.content && (
            <span className="text-xs text-amber-500 font-medium">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            aria-label="Copy cover letter to clipboard"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            aria-label="Download cover letter as PDF"
          >
            <Download className="h-4 w-4 mr-1" />
            Download PDF
          </Button>

          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                aria-busy={isSaving}
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-150 font-mono text-sm resize-y leading-relaxed"
            placeholder="Edit your cover letter here..."
            aria-label="Cover letter content editor"
          />
        </div>
      ) : (
        <div data-color-mode={colorMode}>
          <MDEditor
            value={content}
            preview="preview"
            height={700}
            hideToolbar
          />
        </div>
      )}
    </div>
  );
}