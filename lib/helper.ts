type Entry = {
  title?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
};

export function entriesToMarkdown(entries: Entry[], type: string) {
  if (!entries || entries.length === 0) return "";

  return (
    `## ${type}\n` +
    entries
      .map((entry) => {
        const startDate = entry.startDate || "";
        const endDate = entry.current
          ? "Present"
          : entry.endDate || "";

        const dateRange =
          startDate && endDate
            ? `${startDate} – ${endDate}`
            : startDate || endDate;

        const bulletPoints = entry.description
          ? entry.description
            .split("\n")
            .map((line: string) => line.trim())
            .filter(Boolean)
            .map((line: string) => `– ${line}`)
            .join("\n")
          : "";

        return `
### ${entry.title || ""} | ${entry.organization || ""}  
${dateRange}

${bulletPoints}
`;
      })
      .join("\n")
  );
}