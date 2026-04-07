"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { entriesToMarkdown } from "@/lib/helper";
import { resumeSchema } from "@/schemas/resume";
import html2pdf from "html2pdf.js";

export default function ResumeBuilder({ initialContent, user }: any) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent || "");
  const [resumeMode, setResumeMode] = useState<"edit" | "preview">("preview");
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {
        email: "",
        mobile: "",
        linkedin: "",
        twitter: "",
      },
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch();

  // =======================
  // INITIAL TAB
  // =======================

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  // =======================
  // UPDATE PREVIEW
  // =======================

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent || initialContent || "");
    }
  }, [formValues, activeTab]);

  // =======================
  // SAVE STATUS
  // =======================

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(
        typeof saveError === "string"
          ? saveError
          : "Failed to save resume"
      );
    }
  }, [saveResult, saveError, isSaving]);

  // =======================
  // MARKDOWN BUILDERS
  // =======================

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts: string[] = [];

    if (contactInfo?.mobile) parts.push(contactInfo.mobile);
    if (contactInfo?.email) parts.push(contactInfo.email);
    if (contactInfo?.linkedin)
      parts.push(`[LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo?.twitter)
      parts.push(`[Twitter](${contactInfo.twitter})`);

    return `
# ${user?.name || "Your Name"}

${parts.join(" • ")}
`;
  };

  const formatSkills = (skills: string) => {
    return `## Technical Skills

${skills
  .split(",")
  .map((s) => `– ${s.trim()}`)
  .join("\n")}`;
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;

    return [
      getContactMarkdown(),

      summary ? `## Summary\n\n${summary}` : "",

      skills ? formatSkills(skills) : "",

      entriesToMarkdown(education || [], "Education"),

      entriesToMarkdown(projects || [], "Projects"),

      entriesToMarkdown(experience || [], "Experience"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  // =======================
  // PDF GENERATION
  // =======================

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");

      if (!element) throw new Error("PDF element not found");

      const opt: any = {
        margin: [15, 15, 15, 15],
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // =======================
  // SUBMIT
  // =======================

  const onSubmit = async () => {
    try {
      const formattedContent = previewContent
        .replace(/\n\s*\n/g, "\n\n")
        .trim();

      await saveResumeFn(formattedContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // =======================
  // UI
  // =======================

  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold text-5xl md:text-6xl">
          Resume Builder
        </h1>

        <div className="space-x-2">
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>

          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <Input {...register("contactInfo.email")} placeholder="Email" />
              <Input {...register("contactInfo.mobile")} placeholder="Mobile" />
              <Input {...register("contactInfo.linkedin")} placeholder="LinkedIn" />
              <Input {...register("contactInfo.twitter")} placeholder="Twitter" />
            </div>

            <Controller
              name="summary"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Write a strong summary..."
                />
              )}
            />

            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="React, Node.js, MongoDB..."
                />
              )}
            />

            <Controller
              name="experience"
              control={control}
              render={({ field }) => (
                <EntryForm
                  type="Experience"
                  entries={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="education"
              control={control}
              render={({ field }) => (
                <EntryForm
                  type="Education"
                  entries={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="projects"
              control={control}
              render={({ field }) => (
                <EntryForm
                  type="Project"
                  entries={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </form>
        </TabsContent>

        <TabsContent value="preview">
          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={(val) => setPreviewContent(val || "")}
              height={800}
              preview={resumeMode}
            />
          </div>

          <div className="hidden">
            <div id="resume-pdf">
              <MDEditor.Markdown source={previewContent} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}