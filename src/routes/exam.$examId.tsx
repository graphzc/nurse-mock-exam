import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Send, BookOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getExam } from '#/lib/exam-data'
import { getSession, saveSession, clearSession, saveResult } from '#/lib/exam-storage'
import type { ExamResult } from '#/types/exam'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/exam/$examId')({
  component: ExamPage,
})

function ExamPage() {
  const { examId } = Route.useParams()
  const navigate = useNavigate()
  const exam = getExam(examId)

  const savedSession = exam ? getSession(examId) : null
  const [currentQ, setCurrentQ] = useState(savedSession?.currentQuestion ?? 0)
  const [startedAt] = useState(savedSession?.startedAt ?? new Date().toISOString())

  const initialAnswers: Record<string, number> = savedSession
    ? Object.fromEntries(Object.entries(savedSession.answers).map(([k, v]) => [String(k), v]))
    : {}

  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers)

  const form = useForm({
    defaultValues: { answers: initialAnswers },
    onSubmit: ({ value }) => {
      if (!exam) return
      const finalAnswers = value.answers
      let score = 0
      exam.questions.forEach((q, i) => {
        if (finalAnswers[String(i)] === q.answer) score++
      })
      const result: ExamResult = {
        id: crypto.randomUUID(),
        examId,
        examTitle: exam.title,
        answers: Object.fromEntries(
          Object.entries(finalAnswers).map(([k, v]) => [Number(k), v]),
        ) as Record<number, number>,
        score,
        total: exam.questions.length,
        completedAt: new Date().toISOString(),
      }
      saveResult(result)
      clearSession(examId)
      navigate({ to: '/results/$examId', params: { examId } })
    },
  })

  // Auto-save session on every answer or navigation change
  useEffect(() => {
    if (!exam) return
    saveSession({
      examId,
      examTitle: exam.title,
      answers: Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [Number(k), v]),
      ) as Record<number, number>,
      currentQuestion: currentQ,
      totalQuestions: exam.questions.length,
      startedAt,
    })
  }, [answers, currentQ, exam, examId, startedAt])

  if (!exam) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg-base)' }}
      >
        <div className="text-center">
          <p style={{ color: 'var(--sea-ink-soft)' }}>ไม่พบชุดข้อสอบ</p>
          <Link to="/" className="mt-2 block underline" style={{ color: 'var(--lagoon)' }}>
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    )
  }

  const selectAnswer = (qIndex: number, option: number) => {
    const updated = { ...answers, [String(qIndex)]: option }
    setAnswers(updated)
    form.setFieldValue('answers', updated)
  }

  const question = exam.questions[currentQ]!
  const answeredCount = Object.keys(answers).length
  const currentAnswer = answers[String(currentQ)]
  const isFirst = currentQ === 0
  const isLast = currentQ === exam.questions.length - 1
  const allAnswered = answeredCount === exam.questions.length
  const progressPct = (answeredCount / exam.questions.length) * 100

  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-10 border-b px-4 py-3 backdrop-blur-md"
        style={{ background: 'var(--header-bg)', borderColor: 'var(--line)' }}
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: 'var(--sea-ink-soft)' }}
            >
              <ChevronLeft className="h-4 w-4" />
              ออก
            </Link>
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--sea-ink-soft)' }}>
                {exam.title}
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--sea-ink)' }}>
                ข้อที่ {currentQ + 1} / {exam.questions.length}
              </p>
            </div>
            <span className="text-xs" style={{ color: 'var(--sea-ink-soft)' }}>
              ตอบแล้ว {answeredCount}/{exam.questions.length}
            </span>
          </div>
          {/* Progress bar */}
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: 'var(--sand)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, background: 'var(--lagoon)' }}
            />
          </div>
        </div>
      </header>

      {/* Question navigation mini-map */}
      <div className="border-b px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'var(--line)' }}>
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-wrap gap-1">
            {exam.questions.map((_, i) => {
              const isAnswered = answers[String(i)] !== undefined
              const isCurrent = i === currentQ
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentQ(i)}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded text-xs font-medium transition-all',
                    isCurrent
                      ? 'ring-2 text-white'
                      : isAnswered
                        ? 'text-white'
                        : 'hover:opacity-80',
                  )}
                  style={{
                    background: isCurrent
                      ? 'var(--lagoon)'
                      : isAnswered
                        ? 'var(--palm)'
                        : 'var(--sand)',
                    color: isCurrent || isAnswered ? 'white' : 'var(--sea-ink-soft)',
                    ringColor: isCurrent ? 'var(--lagoon)' : undefined,
                    outline: isCurrent ? '2px solid var(--lagoon)' : undefined,
                    outlineOffset: isCurrent ? '1px' : undefined,
                  }}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          {/* Question card */}
          <div
            className="mb-5 rounded-2xl border bg-white p-6 shadow-sm"
            style={{ borderColor: 'var(--line)' }}
          >
            <div className="mb-4 flex items-center gap-2">
              <span
                className="rounded-full border px-2.5 py-1 text-xs font-bold"
                style={{
                  background: 'var(--foam)',
                  color: 'var(--lagoon-deep)',
                  borderColor: 'rgba(79,184,178,0.2)',
                }}
              >
                ข้อ {currentQ + 1}
              </span>
              <BookOpen className="h-3.5 w-3.5" style={{ color: 'var(--sea-ink-soft)' }} />
            </div>
            <div className="prose prose-sm max-w-none font-medium leading-relaxed" style={{ color: 'var(--sea-ink)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {question.question}
              </ReactMarkdown>
            </div>
          </div>

          {/* Options */}
          <div className="mb-8 space-y-3">
            {Object.entries(question.options).map(([key, value]) => {
              const optionNum = Number(key)
              const isSelected = currentAnswer === optionNum
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectAnswer(currentQ, optionNum)}
                  className="flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150"
                  style={{
                    borderColor: isSelected ? 'var(--lagoon)' : 'var(--line)',
                    background: isSelected ? 'rgba(79,184,178,0.08)' : 'white',
                    boxShadow: isSelected ? '0 1px 4px rgba(79,184,178,0.15)' : undefined,
                  }}
                >
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      background: isSelected ? 'var(--lagoon)' : 'var(--sand)',
                      color: isSelected ? 'white' : 'var(--sea-ink-soft)',
                    }}
                  >
                    {key}
                  </span>
                  <span
                    className={cn('text-sm leading-relaxed', isSelected && 'font-medium')}
                    style={{ color: 'var(--sea-ink)' }}
                  >
                    {value}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Navigation row */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
              disabled={isFirst}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              style={{ borderColor: 'var(--line)', color: 'var(--sea-ink-soft)', background: 'white' }}
            >
              <ChevronLeft className="h-4 w-4" />
              ก่อนหน้า
            </button>

            <div className="flex-1" />

            {!isLast ? (
              <button
                type="button"
                onClick={() => setCurrentQ((q) => Math.min(exam.questions.length - 1, q + 1))}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                style={{ background: 'var(--lagoon)', color: 'white' }}
              >
                ถัดไป
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!allAnswered}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: allAnswered ? 'var(--palm)' : 'var(--sand)',
                  color: allAnswered ? 'white' : 'var(--sea-ink-soft)',
                  cursor: allAnswered ? 'pointer' : 'not-allowed',
                  boxShadow: allAnswered ? '0 2px 8px rgba(47,106,74,0.25)' : undefined,
                }}
              >
                <Send className="h-4 w-4" />
                {allAnswered ? 'ส่งคำตอบ' : `ยังไม่ครบ (${answeredCount}/${exam.questions.length})`}
              </button>
            )}
          </div>

          {/* Floating submit when all answered but not at last question */}
          {allAnswered && !isLast && (
            <div className="mt-5 border-t pt-5" style={{ borderColor: 'var(--line)' }}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all"
                style={{
                  background: 'var(--palm)',
                  color: 'white',
                  boxShadow: '0 2px 10px rgba(47,106,74,0.3)',
                }}
              >
                <Send className="h-4 w-4" />
                ตอบครบแล้ว — ส่งคำตอบ
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
