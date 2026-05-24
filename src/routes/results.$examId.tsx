import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { CheckCircle2, XCircle, Trophy, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { getLatestResult } from '#/lib/exam-storage'
import { clearSession } from '#/lib/exam-storage'
import { getExam } from '#/lib/exam-data'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/results/$examId')({
  component: ResultsPage,
})

function ResultsPage() {
  const { examId } = Route.useParams()
  const navigate = useNavigate()
  const result = getLatestResult(examId)
  const exam = getExam(examId)
  const [showReview, setShowReview] = useState(false)

  if (!result || !exam) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg-base)' }}
      >
        <div className="text-center">
          <p style={{ color: 'var(--sea-ink-soft)' }}>ไม่พบผลการสอบ</p>
          <Link to="/" className="mt-2 block underline" style={{ color: 'var(--lagoon)' }}>
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    )
  }

  const pct = Math.round((result.score / result.total) * 100)
  const passed = pct >= 60

  const handleRetake = () => {
    clearSession(examId)
    navigate({ to: '/exam/$examId', params: { examId } })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b px-4 py-4 backdrop-blur-md"
        style={{ background: 'var(--header-bg)', borderColor: 'var(--line)' }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--sea-ink-soft)' }}
          >
            <Home className="h-4 w-4" />
            หน้าหลัก
          </Link>
          <span className="text-sm font-semibold" style={{ color: 'var(--sea-ink)' }}>
            ผลการสอบ
          </span>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Score card */}
        <div
          className="mb-6 overflow-hidden rounded-2xl shadow-md"
          style={{ background: passed ? 'var(--palm)' : 'var(--lagoon-deep)' }}
        >
          <div className="px-6 pb-8 pt-8 text-center text-white">
            <Trophy className="mx-auto mb-3 h-10 w-10 opacity-90" />
            <p className="mb-1 text-sm opacity-75">{exam.title}</p>
            <div className="mb-1 text-7xl font-bold">{pct}%</div>
            <p className="text-xl font-semibold opacity-90">
              {result.score} / {result.total} ข้อ
            </p>
            <div
              className="mx-auto mt-4 inline-block rounded-full px-5 py-1.5 text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              {passed ? '✓ ผ่านเกณฑ์' : '✗ ไม่ผ่านเกณฑ์ (60%)'}
            </div>
          </div>
          {/* Score breakdown bar */}
          <div style={{ background: 'rgba(0,0,0,0.15)' }} className="px-6 py-4">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
              <span>คะแนน</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'ถูก', value: result.score, color: 'var(--palm)' },
            { label: 'ผิด', value: result.total - result.score, color: '#ef4444' },
            { label: 'ทั้งหมด', value: result.total, color: 'var(--lagoon-deep)' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border bg-white py-4 text-center shadow-sm"
              style={{ borderColor: 'var(--line)' }}
            >
              <div className="text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="mt-0.5 text-xs" style={{ color: 'var(--sea-ink-soft)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mb-8 flex gap-3">
          <button
            onClick={handleRetake}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border bg-white py-2.5 px-4 text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--line)', color: 'var(--sea-ink)' }}
          >
            <RotateCcw className="h-4 w-4" />
            ทำใหม่
          </button>
          <Link
            to="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold transition-colors"
            style={{ background: 'var(--lagoon)', color: 'white' }}
          >
            <Home className="h-4 w-4" />
            หน้าหลัก
          </Link>
        </div>

        {/* Toggle review */}
        <button
          onClick={() => setShowReview((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border bg-white px-5 py-4 text-sm font-semibold shadow-sm transition-colors"
          style={{ borderColor: 'var(--line)', color: 'var(--sea-ink)' }}
        >
          <span>ตรวจคำตอบ ({exam.questions.length} ข้อ)</span>
          {showReview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Review list */}
        {showReview && (
          <div className="mt-4 space-y-4">
            {exam.questions.map((q, i) => {
              const userAnswer = result.answers[i]
              const isCorrect = userAnswer === q.answer

              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm"
                  style={{ borderColor: 'var(--line)' }}
                >
                  {/* Question header */}
                  <div
                    className="flex items-start gap-3 px-4 py-3"
                    style={{
                      background: isCorrect ? 'var(--foam)' : '#fff5f5',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    {isCorrect ? (
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0"
                        style={{ color: 'var(--palm)' }}
                      />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    )}
                    <div>
                      <span
                        className={cn(
                          'text-xs font-bold',
                          isCorrect ? '' : 'text-red-600',
                        )}
                        style={isCorrect ? { color: 'var(--palm)' } : undefined}
                      >
                        ข้อ {i + 1} — {isCorrect ? 'ถูก' : 'ผิด'}
                      </span>
                      <p
                        className="mt-0.5 text-sm leading-relaxed"
                        style={{ color: 'var(--sea-ink)' }}
                      >
                        {q.question}
                      </p>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-1.5 px-4 py-3">
                    {Object.entries(q.options).map(([key, val]) => {
                      const optNum = Number(key)
                      const isUserChoice = userAnswer === optNum
                      const isCorrectAnswer = q.answer === optNum

                      return (
                        <div
                          key={key}
                          className={cn(
                            'flex items-start gap-2 rounded-lg px-3 py-2 text-sm',
                            isCorrectAnswer
                              ? 'border'
                              : isUserChoice && !isCorrectAnswer
                                ? 'border'
                                : '',
                          )}
                          style={{
                            background: isCorrectAnswer
                              ? 'var(--foam)'
                              : isUserChoice && !isCorrectAnswer
                                ? '#fff5f5'
                                : 'transparent',
                            borderColor: isCorrectAnswer
                              ? 'rgba(47,106,74,0.3)'
                              : isUserChoice && !isCorrectAnswer
                                ? 'rgba(239,68,68,0.3)'
                                : 'transparent',
                          }}
                        >
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            style={{
                              background: isCorrectAnswer
                                ? 'var(--palm)'
                                : isUserChoice && !isCorrectAnswer
                                  ? '#ef4444'
                                  : 'var(--sand)',
                              color:
                                isCorrectAnswer || (isUserChoice && !isCorrectAnswer)
                                  ? 'white'
                                  : 'var(--sea-ink-soft)',
                            }}
                          >
                            {key}
                          </span>
                          <span
                            className={cn(
                              isCorrectAnswer
                                ? 'font-medium'
                                : isUserChoice && !isCorrectAnswer
                                  ? 'text-red-600'
                                  : '',
                            )}
                            style={
                              isCorrectAnswer
                                ? { color: 'var(--palm)' }
                                : !isUserChoice && !isCorrectAnswer
                                  ? { color: 'var(--sea-ink-soft)' }
                                  : undefined
                            }
                          >
                            {val}
                            {isCorrectAnswer && (
                              <span className="ml-1 text-xs opacity-70">✓ เฉลย</span>
                            )}
                            {isUserChoice && !isCorrectAnswer && (
                              <span className="ml-1 text-xs opacity-70">(คำตอบของคุณ)</span>
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {/* Explanation */}
                  {q.explanation && (
                    <div
                      className="border-t px-4 py-3 text-sm leading-relaxed"
                      style={{ borderColor: 'var(--line)', color: 'var(--sea-ink-soft)', background: 'var(--sand)' }}
                    >
                      <span className="font-semibold" style={{ color: 'var(--sea-ink)' }}>อธิบายเฉลย: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
