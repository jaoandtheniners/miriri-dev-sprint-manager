'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import AppShell from '@/components/layout/AppShell'
import { Task, TaskStatus, Sprint } from '@/types'
import { TypeBadge, DevAvatar } from '@/components/ui/Badge'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'PENDENTE',     label: 'Pendente',     color: '#888780' },
  { id: 'EM_ANDAMENTO', label: 'Em andamento', color: '#534AB7' },
  { id: 'FEITO',        label: 'Concluído',    color: '#3B6D11' },
]

function TaskCard({ task, overlay }: { task: Task; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`bg-white border border-black/[0.06] rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing ${overlay ? 'rotate-2 shadow-lg' : 'hover:border-black/20'} transition-colors`}>
      <p className="text-[13px] text-gray-900 mb-2 leading-[1.4]">{task.title}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <TypeBadge type={task.type} />
        {task.classification && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E6F1FB] text-[#185FA5] font-medium">
            {task.classification.toLowerCase()}
          </span>
        )}
        {task.developer && <DevAvatar name={task.developer} />}
      </div>
    </div>
  )
}

function Column({ id, label, color, tasks }: { id: TaskStatus; label: string; color: string; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-[12px] font-medium text-gray-500">{label}</span>
        </div>
        <span className="text-[11px] bg-gray-100 text-gray-400 rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className={`min-h-[80px] rounded-xl transition-colors ${isOver ? 'bg-[#EEEDFE]/40' : ''}`}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => <TaskCard key={task.id} task={task} />)}
        </SortableContext>
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [sprint, setSprint] = useState<Sprint | null>(null)
  const [devFilter, setDevFilter] = useState<string>('all')
  const [active, setActive] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    async function load() {
      const { data: sprints } = await supabase.from('sprints').select('*').eq('status', 'ATIVA').limit(1)
      const s = sprints?.[0] ?? null
      setSprint(s)
      if (s) {
        const { data } = await supabase.from('tasks').select('*').eq('sprint_id', s.id).order('created_at')
        setTasks(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = devFilter === 'all' ? tasks : tasks.filter(t => t.developer === devFilter)

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const newStatus = over.id as TaskStatus
    const task = tasks.find(t => t.id === active.id)
    if (!task || task.status === newStatus) return
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    await supabase.from('tasks').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', task.id)
  }

  if (loading) return <AppShell><div className="flex items-center justify-center h-64 text-gray-400 text-sm">Carregando...</div></AppShell>

  return (
    <AppShell>
      <div className="p-6 page-transition">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[18px] font-medium text-gray-900">Kanban</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">Arraste as tasks entre as colunas</p>
          </div>
          <div className="flex gap-2">
            <select value={devFilter} onChange={e => setDevFilter(e.target.value)}
              className="px-3 py-1.5 text-[12px] rounded-lg border border-black/10 bg-white text-gray-700">
              <option value="all">Todos os devs</option>
              <option value="Israel">Israel</option>
              <option value="João Vitor">João Vitor</option>
              <option value="Antonia">Antonia</option>
            </select>
          </div>
        </div>

        <DndContext sensors={sensors} onDragStart={(e: DragStartEvent) => setActive(tasks.find(t => t.id === e.active.id) ?? null)}
          onDragEnd={(e) => { handleDragEnd(e); setActive(null) }}>
          <div className="grid grid-cols-3 gap-4">
            {COLUMNS.map(col => (
              <Column key={col.id} {...col} tasks={filtered.filter(t => t.status === col.id)} />
            ))}
          </div>
          <DragOverlay>{active ? <TaskCard task={active} overlay /> : null}</DragOverlay>
        </DndContext>
      </div>
    </AppShell>
  )
}
