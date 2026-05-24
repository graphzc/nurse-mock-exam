import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle, Clock, ArrowRight, Star } from "lucide-react";
import { getExamList } from "#/lib/exam-data";
import { getSession, getLatestResult } from "#/lib/exam-storage";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/")({ component: SelectPage });

function SelectPage() {
  const exams = getExamList();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b px-6 py-4 backdrop-blur-md"
        style={{
          background: "var(--header-bg)",
          borderColor: "var(--line)",
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--lagoon)" }}
          >
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1
              className="text-lg font-bold leading-none"
              style={{ color: "var(--sea-ink)" }}
            >
              ข้อสอบพยาบาล
            </h1>
            <p
              className="mt-0.5 text-xs"
              style={{ color: "var(--sea-ink-soft)" }}
            >
              Nurse Mock Exam
            </p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="px-6 pb-2 pt-10">
        <div className="mx-auto max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--lagoon-deep)" }}
          >
            เลือกชุดข้อสอบ
          </p>
          <h2
            className="mt-1 text-3xl font-bold"
            style={{ color: "var(--sea-ink)" }}
          >
            ฝึกทำข้อสอบ
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--sea-ink-soft)" }}>
            เลือกชุดข้อสอบที่ต้องการ ระบบจะบันทึกความก้าวหน้าให้อัตโนมัติ
          </p>
        </div>
      </div>

      {/* Exam cards */}
      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="grid gap-4">
          {exams.map((exam) => {
            const session = getSession(exam.id);
            const result = getLatestResult(exam.id);
            const answeredCount = session
              ? Object.keys(session.answers).length
              : 0;
            const pct = result
              ? Math.round((result.score / result.total) * 100)
              : null;
            const inProgress = !!session && !result;

            return (
              <div
                key={exam.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md"
                style={{ borderColor: "var(--line)" }}
              >
                {/* Status strip */}
                {(result || inProgress) && (
                  <div
                    className="px-5 py-2 text-xs font-semibold"
                    style={{
                      background: result
                        ? "var(--foam)"
                        : "rgba(79,184,178,0.08)",
                      color: result ? "var(--palm)" : "var(--lagoon-deep)",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    {result ? (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" />
                        สอบแล้ว — คะแนนล่าสุด {result.score}/{result.total} (
                        {pct}%)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        กำลังทำอยู่ — ตอบแล้ว {answeredCount}/
                        {exam.questions.length} ข้อ
                      </span>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1">
                      <h3
                        className="text-lg font-semibold leading-snug"
                        style={{ color: "var(--sea-ink)" }}
                      >
                        {exam.title}
                      </h3>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--sea-ink-soft)" }}
                      >
                        {exam.questions.length} ข้อ
                      </p>
                    </div>

                    {/* Score ring */}
                    {result && pct !== null ? (
                      <div className="relative h-16 w-16 shrink-0">
                        <svg
                          viewBox="0 0 36 36"
                          className="h-full w-full -rotate-90"
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9"
                            fill="none"
                            stroke="var(--sand)"
                            strokeWidth="3"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9"
                            fill="none"
                            stroke={pct >= 60 ? "var(--palm)" : "var(--lagoon)"}
                            strokeWidth="3"
                            strokeDasharray={`${pct} 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span
                          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                          style={{
                            color:
                              pct >= 60 ? "var(--palm)" : "var(--lagoon-deep)",
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    ) : inProgress ? (
                      <div className="relative h-16 w-16 shrink-0">
                        <svg
                          viewBox="0 0 36 36"
                          className="h-full w-full -rotate-90"
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9"
                            fill="none"
                            stroke="var(--sand)"
                            strokeWidth="3"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9"
                            fill="none"
                            stroke="var(--lagoon)"
                            strokeWidth="3"
                            strokeDasharray={`${Math.round((answeredCount / exam.questions.length) * 100)} 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span
                          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                          style={{ color: "var(--lagoon-deep)" }}
                        >
                          {Math.round(
                            (answeredCount / exam.questions.length) * 100,
                          )}
                          %
                        </span>
                      </div>
                    ) : (
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                        style={{ background: "var(--foam)" }}
                      >
                        <Star
                          className="h-6 w-6"
                          style={{ color: "var(--lagoon)" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex gap-3">
                    <Link
                      to="/exam/$examId"
                      params={{ examId: exam.id }}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                      )}
                      style={{ background: "var(--lagoon)", color: "white" }}
                    >
                      {inProgress ? "ทำต่อ" : result ? "ทำใหม่" : "เริ่มสอบ"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    {result && (
                      <Link
                        to="/results/$examId"
                        params={{ examId: exam.id }}
                        className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
                        style={{
                          borderColor: "var(--lagoon)",
                          color: "var(--lagoon-deep)",
                          background: "transparent",
                        }}
                      >
                        ดูผล
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
