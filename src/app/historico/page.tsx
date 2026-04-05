'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import AppShell from '@/components/layout/AppShell'
import { Sprint, Task } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TypeBadge, StatusBadge, DevAvatar } from '@/components/ui/Badge'

function SprintCard({ sprint }: { sprint: Sprint }) {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function toggle() {
    if (!loaded) {
      const { data } = await supabase.from('tasks').select('*').eq('sprint_id', sprint.id).order('developer')
      setTasks(data ?? [])
      setLoaded(true)
    }
    setOpen(p => !p)
  }

  const done = tasks.filter(t => t.status === 'FEITO').length
  const realloc = tasks.filter(t => t.status === 'NAO_CONCLUIDA').length
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const color = pct >= 80 ? 'text-green-700' : pct >= 60 ? 'text-amber-700' : 'text-red-600'
  const barColor = pct >= 80 ? '#3B6D11' : pct >= 60 ? '#BA7517' : '#E24B4A'

  return (
    <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {open ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-gray-900">Sprint {format(new Date(sprint.start_date), 'dd/MM', { locale: ptBR })} – {format(new Date(sprint.end_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{sprint.status === 'ATIVA' ? 'Em andamento' : 'Encerrada'}</p>
          </div>
        </div>
        {loaded && (
          <div className="flex items-center gap-6 shrink-0 ml-4">
            <div className="text-right">
              <p className="text-[12px] text-gray-400">{done} concluídas</p>
              <p className="text-[11px] text-gray-300">{realloc} realocadas</p>
            </div>
            <div className="w-24">
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-gray-400">Conclusão</span>
                <span className={`text-[11px] font-medium ${color}`}>{pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
              </div>
            </div>
          </div>
        )}
        <span className={`ml-4 text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0 ${sprint.status === 'ATIVA' ? 'bg-[#EEEDFE] text-[#534AB7]' : 'bg-gray-100 text-gray-500'}`}>
          {sprint.status === 'ATIVA' ? 'Ativa' : 'Encerrada'}
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {tasks.length === 0 ? (
            <p className="text-center py-8 text-[13px] text-gray-400">Nenhuma task nesta sprint</p>
          ) : (
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-2 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide w-[45%]">Atividade</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">Dev</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">Tipo</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">Obs.</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-2.5 text-gray-900 leading-snug">{t.title}</td>
                    <td className="px-4 py-2.5">
                      {t.developer ? (
                        <div className="flex items-center gap-1.5">
                          <DevAvatar name={t.developer} />
                          <span className="text-gray-500 text-[12px]">{t.developer.split(' ')[0]}</span>
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5"><TypeBadge type={t.type} /></td>
                    <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-2.5 text-[12px] text-gray-400 max-w-[200px] truncate">{t.observations ?? t.unforeseen ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default function HistoricoPage() {
  const supabase = createClient()
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('sprints').select('*').order('start_date', { ascending: false })
      setSprints(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <AppShell>
      <div className="p-6 page-transition">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[18px] font-medium text-gray-900">Histórico de sprints</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">{sprints.length} sprints registradas</p>
          </div>
          <button className="px-4 py-1.5 bg-[#534AB7] text-[#EEEDFE] rounded-lg text-[13px] font-medium hover:bg-[#3C3489] transition-colors">
            + Nova sprint
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Carregando...</div>
        ) : sprints.length === 0 ? (
          <div className="text-center py-16 text-[13px] text-gray-400">Nenhuma sprint registrada ainda</div>
        ) : (
          <div className="flex flex-col gap-3">
            {sprints.map(s => <SprintCard key={s.id} sprint={s} />)}
          </div>
        )}
      </div>
    </AppShell>
  )
}
