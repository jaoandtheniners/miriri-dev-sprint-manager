export type TaskStatus = 'PENDENTE' | 'EM_ANDAMENTO' | 'FEITO' | 'NAO_CONCLUIDA'
export type TaskType = 'NEW' | 'BUG' | 'ATT' | 'EXTRA'
export type TaskClassification = 'FE' | 'BE' | 'BD' | 'SI' | 'EX'
export type Priority = 'ALTA' | 'MEDIA' | 'BAIXA' | 'URGENTE'
export type Developer = 'Israel' | 'João Vitor' | 'Antonia' | 'Outro'

export interface Sprint {
  id: string
  name: string
  start_date: string
  end_date: string
  status: 'ATIVA' | 'ENCERRADA' | 'PLANEJADA'
  created_at: string
}

export interface Task {
  id: string
  sprint_id: string | null
  title: string
  type: TaskType
  classification: TaskClassification | null
  priority: Priority
  module: string | null
  developer: Developer | null
  status: TaskStatus
  observations: string | null
  unforeseen: string | null
  is_backlog: boolean
  created_at: string
  updated_at: string
}

export interface WeeklyReport {
  id: string
  sprint_id: string
  report_date: string
  general_observations: string | null
  created_at: string
}

export interface ReportEntry {
  id: string
  weekly_report_id: string
  task_id: string
  developer: Developer
  status: TaskStatus
  observations: string | null
  task?: Task
}

export interface SprintMetrics {
  total_planned: number
  total_done: number
  total_reallocated: number
  completion_pct: number
  by_developer: {
    developer: Developer
    planned: number
    done: number
    pct: number
  }[]
}
