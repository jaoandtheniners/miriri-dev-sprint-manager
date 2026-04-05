import clsx from 'clsx'
import { TaskType, TaskStatus, Priority } from '@/types'

const TYPE_STYLES: Record<TaskType, string> = {
  NEW:   'bg-[#EEEDFE] text-[#534AB7]',
  BUG:   'bg-[#FCEBEB] text-[#A32D2D]',
  ATT:   'bg-[#FAEEDA] text-[#633806]',
  EXTRA: 'bg-[#E1F5EE] text-[#0F6E56]',
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  PENDENTE:     'bg-[#FAEEDA] text-[#633806]',
  EM_ANDAMENTO: 'bg-[#EEEDFE] text-[#534AB7]',
  FEITO:        'bg-[#EAF3DE] text-[#3B6D11]',
  NAO_CONCLUIDA:'bg-[#FCEBEB] text-[#A32D2D]',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  FEITO: 'Feito',
  NAO_CONCLUIDA: 'Não concluída',
}

const PRIORITY_STYLES: Record<Priority, string> = {
  URGENTE: 'text-red-700',
  ALTA:    'text-red-600',
  MEDIA:   'text-amber-700',
  BAIXA:   'text-gray-500',
}

const PRIORITY_LABELS: Record<Priority, string> = {
  URGENTE: 'Urgente',
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa',
}

export function TypeBadge({ type }: { type: TaskType }) {
  return (
    <span className={clsx('text-[11px] px-2 py-0.5 rounded-full font-medium', TYPE_STYLES[type])}>
      {type.toLowerCase()}
    </span>
  )
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={clsx('text-[11px] px-2 py-0.5 rounded-full font-medium', STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function PriorityLabel({ priority }: { priority: Priority }) {
  return (
    <span className={clsx('text-[12px] font-medium', PRIORITY_STYLES[priority])}>
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

export function DevAvatar({ name }: { name: string }) {
  const MAP: Record<string, { initials: string; cls: string }> = {
    'Israel':     { initials: 'IS', cls: 'bg-[#EEEDFE] text-[#534AB7]' },
    'João Vitor': { initials: 'JV', cls: 'bg-[#E1F5EE] text-[#0F6E56]' },
    'Antonia':    { initials: 'AN', cls: 'bg-[#FAEEDA] text-[#633806]' },
  }
  const dev = MAP[name] ?? { initials: name.slice(0, 2).toUpperCase(), cls: 'bg-gray-100 text-gray-500' }
  return (
    <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium shrink-0', dev.cls)}>
      {dev.initials}
    </div>
  )
}
