import type { ExamTemplate } from "#/types/exam";

// Eagerly import every *.json placed in exam-templates/.
// Adding a new file there is enough — no code change required.
const modules = import.meta.glob<{ default: Omit<ExamTemplate, "id"> }>(
  "../exam-templates/*.json",
  { eager: true },
);

const examTemplates: ExamTemplate[] = Object.entries(modules).map(
  ([path, mod]) => {
    // "../exam-templates/adult-1.json"  →  "adult-1"
    const id = path.replace(/^.*\//, "").replace(/\.json$/, "");
    return { id, ...mod.default };
  },
);

export function getExamList(): ExamTemplate[] {
  return examTemplates;
}

export function getExam(id: string): ExamTemplate | undefined {
  return examTemplates.find((e) => e.id === id);
}
