export function entriesToMarkdown(entries: any[], type: string) {
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

        // 🔥 Convert description → bullet points
        const bulletPoints = entry.description
          ? entry.description
              .split("\n")                // user writes line by line
              .map((line: string) => line.trim())
              .filter(Boolean)
              .map((line: string) => `– ${line}`) // add bullet
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