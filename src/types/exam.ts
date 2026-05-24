export interface ExamQuestion {
  question: string;
  options: Record<string, string>;
  answer: number;
}

export interface ExamTemplate {
  id: string;
  title: string;
  questions: ExamQuestion[];
}

export interface ExamSession {
  examId: string;
  examTitle: string;
  answers: Record<number, number>;
  currentQuestion: number;
  totalQuestions: number;
  startedAt: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  answers: Record<number, number>;
  score: number;
  total: number;
  completedAt: string;
}
