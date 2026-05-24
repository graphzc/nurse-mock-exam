import type { ExamSession, ExamResult } from "#/types/exam";

const SESSION_PREFIX = "nurse-exam:session:";
const RESULTS_KEY = "nurse-exam:results";

export function getSession(examId: string): ExamSession | null {
  try {
    const raw = localStorage.getItem(`${SESSION_PREFIX}${examId}`);
    return raw ? (JSON.parse(raw) as ExamSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: ExamSession): void {
  localStorage.setItem(
    `${SESSION_PREFIX}${session.examId}`,
    JSON.stringify(session),
  );
}

export function clearSession(examId: string): void {
  localStorage.removeItem(`${SESSION_PREFIX}${examId}`);
}

export function getResults(): ExamResult[] {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    return raw ? (JSON.parse(raw) as ExamResult[]) : [];
  } catch {
    return [];
  }
}

export function getLatestResult(examId: string): ExamResult | null {
  const all = getResults().filter((r) => r.examId === examId);
  if (all.length === 0) return null;
  return all.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  )[0]!;
}

export function saveResult(result: ExamResult): void {
  const results = getResults();
  results.push(result);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}
